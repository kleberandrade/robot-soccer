# Camera, markers, and scale

![Camera above midfield and the two views of one state](https://robot-soccer.vercel.app/learning/camera.svg)

A plan drawing and a camera image are different things. A plan keeps metric scale everywhere. A perspective camera makes objects smaller with distance and changes the apparent field shape when tilted. The laboratory keeps a 3D scene beside a synthetic 2D sensor projection so you can compare the two.

## One state feeds both views

Both viewports receive the same `shown` match state and display the same frame number. They use the same robot poses, physical dimensions, field markings, ball radius, and tag patches. The camera projection never advances a separate simulation.

The camera is fixed over midfield. Its default height is 2 m; the height control starts at that reference minimum. **Tilt**, **yaw**, and **vertical FOV** change its projection. The sensor aspect ratio is 4:3. If the field no longer fits the image, a visible crop warning appears.

Use **Show camera rig** to frame the camera body and frustum in the 3D scene. Use **Frame field** to return to a closer field inspection. You can still orbit and zoom manually. Camera controls affect the view, not the robot commands or collision geometry.

## A simple pinhole model

For a world point, subtract the camera position, then express that vector along the camera's right, up, and forward axes. Let those coordinates be `X`, `Y`, and positive depth `Z`. For vertical field of view `fov` and image aspect ratio `aspect`, the normalized image location is:

```text
u = 0.5 + X / (2 * Z * tan(fov / 2) * aspect)
v = 0.5 - Y / (2 * Z * tan(fov / 2))
```

The image center is `(0.5, 0.5)`. Increasing height increases the distance to the field and reduces apparent scale. Yaw rotates the image axes; tilt moves the optical axis away from a vertical view and produces perspective foreshortening.

The synthetic view projects the **top** of a robot at its configured height. Treating the marker as lying on the floor would introduce a height-dependent geometric error. The camera footprint drawn in 3D is obtained by intersecting the sensor corner rays with the field plane.

## Four experiments with predictions

1. **Height:** raise the camera from 2 m to 4 m with zero tilt. A fixed separation on the floor should occupy half as many normalized image units.
2. **Yaw:** use 90°. The field rotates in the sensor frame; the robots' world coordinates do not rotate.
3. **Tilt:** use 20°. Compare the near and far edges and watch for a crop warning. Increase height or FOV to restore coverage.
4. **Robot size:** create a custom preview with a different permitted body side and a fitting axle track. Both the 3D body and projected footprint must change together.

The automated camera tests check the centered projection, height scaling, yaw/tilt changes, behind-camera rejection, and reprojection of footprint corners.

## Why there are colored patches above each robot

The selected rulebook includes a standardized color-marker appendix. The implementation uses its metric patch layout: one 30 × 65 mm team rectangle and two 30 × 30 mm ID squares, separated by 5 mm, within a 65 mm square marker area. The three supplied IDs use distinct nominal red/green/cyan combinations; the team patch is blue or yellow.

These patches are actual geometry on the 3D top plate and the same metric polygons in the camera view. They are not floating labels. The side-panel legend connects ID 0, 1 and 2 to their two-color combinations. The colors are nominal display values, not calibrated samples of the organizer's physical tags.

The field reference uses a black surface, orange ball, white markings, shallow goal pockets, and chamfered corners. The old green laboratory rendering has been replaced. Configured dimensions are shown in meters beside the synchronized views.

![Metric top marker layout for blue robot zero](https://robot-soccer.vercel.app/learning/markers.svg)

## What a real camera still needs

The SVG sensor projection is synthetic. It is not a webcam feed, a segmentation algorithm, or a physically validated vision pipeline. It does not model lens distortion, exposure, shadows, blur, rolling shutter, tag-print variation or packet loss.

A physical pipeline would need intrinsic lens calibration, camera pose/field calibration, a defined color space and lighting procedure, blob or tag detection, association of team/ID/orientation, timestamping, and uncertainty estimates. Validate those steps using authorized real images and measured ground truth before replacing perfect simulated observations.

For background on centralized robot-soccer vision, see the original [SSL-Vision paper by Zickler et al.](https://www.cs.cmu.edu/~mmv/papers/09robocup-sslvision.pdf). SSL and VSSS are different leagues with different marker systems; that paper motivates a vision architecture, not VSSS tag compliance.

## A useful debugging habit

When a robot looks wrong, first ask whether its **world pose**, **body dimensions**, **tag orientation**, or **camera projection** is wrong. Change one variable at a time. The simultaneous views help separate a steering problem from a viewing problem.
