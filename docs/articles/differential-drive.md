# Differential drive: from two wheels to a moving robot

![Wheel speeds and axle track determine linear and angular speed](https://robot-soccer.vercel.app/learning/drive.svg)

A robot does not move sideways because its target is to the left. It first changes its heading by driving its two wheels at different speeds. The simulator makes that chain visible in the 3D model and stores wheel phases in the replay state.

## Start with units

Positions and distances are in **meters**. Heading and wheel phase are in **radians**. Left/right commands are linear wheel velocities in **meters per second**. A physics tick lasts `1 / 60` second. The browser's rendering rate does not change the simulation timestep.

Three dimensions have different jobs:

- `robotSide` bounds the square robot envelope.
- `wheelBase` is the distance between the two wheel centerlines.
- `wheelRadius` converts wheel travel into wheel rotation.

Changing a visual cube without changing those values would give a misleading demonstration. Here both views and the engine read the same configuration.

## Straight motion

Let `vL` and `vR` be the actual left and right wheel velocities, and `b` the axle track. The body speed is:

```text
v = (vL + vR) / 2
```

For `vL = vR = 0.30 m/s`, the robot moves forward at 0.30 m/s once the motors reach that speed. In one physics tick it travels 5 mm. Equal negative velocities move backward. Equal velocities do not change heading.

## Turning

The yaw rate is:

```text
omega = (vR - vL) / b
```

A slower left wheel turns the heading toward the left in the field coordinate system. Opposite wheel velocities of equal magnitude rotate the robot in place. A larger axle track produces a smaller yaw rate for the same velocity difference.

For constant wheel velocities within one tick, the engine integrates an arc. With heading `theta`, duration `dt`, body speed `v`, and nonzero `omega`:

```text
nextTheta = theta + omega * dt
nextX = x + (v / omega) * (sin(nextTheta) - sin(theta))
nextY = y - (v / omega) * (cos(nextTheta) - cos(theta))
```

The straight-line limit is used near zero yaw rate to avoid division by a tiny number. Robot collisions and field boundaries are handled after unconstrained wheel-driven motion.

## Why the wheel spokes rotate

A wheel that travels a distance `ds` has turned through `ds / radius` radians. Each tick stores:

```text
leftRotation += actualLeftSpeed * dt / wheelRadius
rightRotation += actualRightSpeed * dt / wheelRadius
```

The 3D renderer interpolates these stored angles. It does not spin the wheels from an unrelated decorative clock. A paused match holds the phases fixed; a replay reconstructs the same phases. Opposite wheel speeds produce opposite phase changes.

Zoom close to a robot in the 3D view. Watch the pale spokes on its two dark tires, then compare them with its movement in the camera projection.

## Commands are not instantaneous motor speeds

The default reference uses a simplified acceleration limit. With acceleration 3 m/s² and a 1/60-second tick, a wheel may change speed by at most 0.05 m/s per tick. A command for 0.30 m/s therefore ramps up instead of jumping directly from rest.

The state distinguishes the desired target from the actual wheel speed. Referee stops immediately zero both for safe deterministic stoppages. The historical user preset permits an instantaneous response (`motorAcceleration = 0`) to preserve its earlier educational behavior.

This is an acceleration-limited drive model, not an identified electromechanical model. It does not simulate motor current, battery sag, gear backlash, tire deformation, mass-dependent traction, or full rigid-body dynamics. At a wall, commanded wheel travel can represent slip while the body remains blocked. Physical calibration is still necessary.

## A reproducible experiment

1. Start a fresh preview and leave the reference axle track at 65 mm.
2. Run and pause the match. Observe a robot turning while its wheels differ in speed.
3. Configure a custom track of 50 mm, apply to a new preview, and compare.
4. Explain why the same wheel velocity difference creates a larger yaw rate.

The configuration validator rejects a track plus wheel thickness that cannot fit within the body. Bare robots in the selected VSSS reference are limited to the 75 mm envelope. A custom training setting is not a claim of competition compliance.

## Learn more

The simulator's target-to-wheel controller is a simple heading-and-distance controller. For a deeper navigation method, see R. Craig Coulter's original [Implementation of the Pure Pursuit Path Tracking Algorithm, Carnegie Mellon, 1992](https://www.ri.cmu.edu/publications/implementation-of-the-pure-pursuit-path-tracking-algorithm/). That report is background reading; this project does not claim to implement its full algorithm.

Continue with [Fouls and restarts](/docs/referee-and-restarts) to understand why a correctly moving robot may still need to stop.
