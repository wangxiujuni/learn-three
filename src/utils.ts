import { Box3, Group, Object3D, Vector3 } from "three";

/**
 * 居中模型到场景中心
 * @param model
 */
export function centerModel(model: Object3D) {
  const AABB = new Box3();
  AABB.expandByObject(model);
  const vec = new Vector3();
  AABB.getCenter(vec);
  model.position.set(-vec.x, -vec.y, -vec.z);
}
