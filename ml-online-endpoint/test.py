import numpy as np
import matplotlib.pyplot as plt
from matplotlib import animation

# Set the initial values of x, y, and z
x, y, z = (0.1, 0, 0)

# Set the parameters sigma, rho, and beta
sigma, rho, beta = (10, 28, 8/3)

# Set the number of time steps
n_steps = 10000

# Set the time step size
dt = 0.01

# Initialize empty lists to store the values of x, y, and z
x_values, y_values, z_values = [x], [y], [z]

# Iterate over the time steps
for i in range(n_steps):
  # Calculate the derivatives of x, y, and z
  dx = sigma * (y - x)
  dy = x * (rho - z) - y
  dz = x * y - beta * z
  # Update the values of x, y, and z
  x += dx * dt
  y += dy * dt
  z += dz * dt
  # Append the new values of x, y, and z to the lists
  x_values.append(x)
  y_values.append(y)
  z_values.append(z)

# Convert the lists to NumPy arrays
x_values = np.array(x_values)
y_values = np.array(y_values)
z_values = np.array(z_values)

# Create a figure and a 3D axis
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# Set the axis limits
ax.set_xlim((-30, 30))
ax.set_ylim((-30, 30))
ax.set_zlim((0, 50))

# Set the axis labels
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')

# Initialize a line object to be plotted in the animation
line, = ax.plot([], [], [], lw=0.5)

# Define the update function for the animation
def update(num):
  line.set_data(x_values[:num], y_values[:num])
  line.set_3d_properties(z_values[:num])
  return line,

# Create the animation
anim = animation.FuncAnimation(fig, update, frames=n_steps, interval=1, blit=True)

# Show the animation
plt.show()

