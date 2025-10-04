import sys
import librosa
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import animation
import subprocess

if len(sys.argv) != 3:
    print("Usage: python vis.py <path_to_mp3> <theme_number>")
    print("Theme numbers: 1=Agni (Fire), 2=Vayu (Wind), 3=Indra (Thunder/Storm)")
    sys.exit(1)

audio_path = sys.argv[1]
theme_number = int(sys.argv[2])

if theme_number not in [1, 2, 3]:
    print("Invalid theme number. Choose 1, 2, or 3.")
    sys.exit(1)

# Load audio
y, sr = librosa.load(audio_path, sr=None)

# Compute onset strength
onset_env = librosa.onset.onset_strength(y=y, sr=sr)
onset_normalized = onset_env / np.max(onset_env) if np.max(onset_env) > 0 else onset_env

# Duration and FPS
duration = len(y) / sr
num_frames = len(onset_normalized)
fps = num_frames / duration if duration > 0 else 30

# Particle system defaults
particles = []
num_particles_per_burst = 30
max_life = 50
explosion_threshold = 0.3
pulse_color = 'gold'
cmap = 'plasma'
alpha = 0.8
silent_path = "silent_visualization.mp4"
output_path = "output_with_audio.mp4"
has_swirl = False  # For wind theme

# Theme-specific adjustments
if theme_number == 1:  # Agni (Fire)
    explosion_threshold = 0.2
    max_life = 60
    pulse_color = 'orange'
    cmap = 'OrRd'
    alpha = 0.8
    silent_path = "agni_silent.mp4"
    output_path = "agni_with_audio.mp4"
elif theme_number == 2:  # Vayu (Wind)
    explosion_threshold = 0.25
    max_life = 40
    pulse_color = 'lightblue'
    cmap = 'Blues'
    alpha = 0.8
    has_swirl = True
    silent_path = "vayu_silent.mp4"
    output_path = "vayu_with_audio.mp4"
elif theme_number == 3:  # Indra (Thunder/Storm)
    explosion_threshold = 0.4
    max_life = 30
    pulse_color = 'gold'
    cmap = 'Purples'
    alpha = 0.9
    silent_path = "indra_silent.mp4"
    output_path = "indra_with_audio.mp4"

# Setup (zoom in, full black)
fig = plt.figure(facecolor='black')
ax = fig.add_subplot(111, projection='polar')
ax.set_ylim(0, 2.5)  # Extended for rise
ax.set_yticks([])
ax.set_xticks([])
ax.set_facecolor('black')
fig.subplots_adjust(left=0, right=1, top=1, bottom=0)  # No white borders

# Central pulse
pulse = ax.add_patch(plt.Circle((0, 0), 0, color=pulse_color, alpha=0.6 if theme_number != 3 else 0.7))

# Particle scatter
sc = ax.scatter([], [], c=[], s=[], cmap=cmap, alpha=alpha)

def init():
    pulse.set_radius(0)
    sc.set_offsets(np.empty((0, 2)))
    sc.set_array(np.array([]))
    sc.set_sizes(np.array([]))
    return pulse, sc

def animate(frame):
    global particles
    intensity = onset_normalized[frame % num_frames]
    
    # Central pulse
    pulse_radius = intensity * (0.4 if theme_number != 3 else 0.5)
    pulse.set_radius(pulse_radius)
    
    # Trigger explosion (upwards bias)
    if intensity > explosion_threshold:
        for _ in range(num_particles_per_burst):
            theta = np.random.uniform(-np.pi/3, np.pi/3)
            speed = np.random.uniform(0.03 if theme_number == 1 else 0.05 if theme_number == 2 else 0.06, 
                                      0.1 if theme_number == 1 else 0.12 if theme_number == 2 else 0.15) * intensity
            color_val = np.random.uniform(0.5 if theme_number == 1 else 0.3 if theme_number == 2 else 0, 1)
            if theme_number == 3 and np.random.rand() > 0.7:
                color_val = 1  # Gold flashes
            size = np.random.uniform(5 if theme_number == 1 else 3 if theme_number == 2 else 5, 
                                     15 if theme_number == 1 else 10 if theme_number == 2 else 20)
            particle = {'r': 0, 'theta': theta, 'speed': speed, 'life': max_life, 'color': color_val, 'size': size}
            if has_swirl:
                particle['swirl'] = np.random.uniform(-0.02, 0.02)
            particles.append(particle)
    
    # Update particles
    for p in particles:
        p['r'] += p['speed']
        if has_swirl:
            p['theta'] += p['swirl']
        p['life'] -= 1
        fade_factor = 0.9 if theme_number == 1 else 1.0 if theme_number == 2 else 0.8
        p['color'] *= (p['life'] / max_life) * fade_factor
        shrink_factor = 0.98 if theme_number == 1 else 0.95 if theme_number == 2 else 0.9
        p['size'] *= shrink_factor
    
    particles = [p for p in particles if p['life'] > 0]
    
    if particles:
        thetas = [p['theta'] for p in particles]
        rs = [p['r'] for p in particles]
        colors = [p['color'] for p in particles]
        sizes = [p['size'] for p in particles]
        sc.set_offsets(np.c_[thetas, rs])
        sc.set_array(np.array(colors))
        sc.set_sizes(np.array(sizes))
    else:
        sc.set_offsets(np.empty((0, 2)))
        sc.set_array(np.array([]))
        sc.set_sizes(np.array([]))
    
    return pulse, sc

# Create animation
anim = animation.FuncAnimation(fig, animate, init_func=init, frames=num_frames, interval=1000/fps, blit=True)

# Save silent video
anim.save(silent_path, writer='ffmpeg', fps=fps, extra_args=['-vcodec', 'libx264'])
print(f"Silent visualization saved to {silent_path}")

# Merge audio using FFmpeg via subprocess
merge_cmd = [
    'ffmpeg', '-y',  # Overwrite if exists
    '-i', silent_path,
    '-i', audio_path,
    '-c:v', 'copy',  # Copy video stream
    '-c:a', 'aac',   # Encode audio to AAC (common for MP4)
    '-strict', 'experimental',
    output_path
]
subprocess.call(merge_cmd)
print(f"Final visualization with audio saved to {output_path}")

plt.close(fig)