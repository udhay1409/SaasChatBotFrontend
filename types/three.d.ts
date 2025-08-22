import { Object3DNode } from '@react-three/fiber'
import { 
  Mesh, 
  BufferGeometry, 
  Material, 
  AmbientLight, 
  DirectionalLight, 
  PointLight, 
  SpotLight,
  PerspectiveCamera,
  OrthographicCamera,
  Group,
  Scene,
  BufferAttribute,
  SphereGeometry,
  BoxGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Points,
  PointsMaterial
} from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Lights
      ambientLight: Object3DNode<AmbientLight, typeof AmbientLight>
      directionalLight: Object3DNode<DirectionalLight, typeof DirectionalLight>
      pointLight: Object3DNode<PointLight, typeof PointLight>
      spotLight: Object3DNode<SpotLight, typeof SpotLight>
      
      // Cameras
      perspectiveCamera: Object3DNode<PerspectiveCamera, typeof PerspectiveCamera>
      orthographicCamera: Object3DNode<OrthographicCamera, typeof OrthographicCamera>
      
      // Objects
      mesh: Object3DNode<Mesh, typeof Mesh>
      group: Object3DNode<Group, typeof Group>
      scene: Object3DNode<Scene, typeof Scene>
      points: Object3DNode<Points, typeof Points>
      
      // Geometries
      sphereGeometry: Object3DNode<SphereGeometry, typeof SphereGeometry>
      boxGeometry: Object3DNode<BoxGeometry, typeof BoxGeometry>
      planeGeometry: Object3DNode<PlaneGeometry, typeof PlaneGeometry>
      bufferGeometry: Object3DNode<BufferGeometry, typeof BufferGeometry>
      
      // Materials
      meshStandardMaterial: Object3DNode<MeshStandardMaterial, typeof MeshStandardMaterial>
      meshBasicMaterial: Object3DNode<MeshBasicMaterial, typeof MeshBasicMaterial>
      meshPhongMaterial: Object3DNode<MeshPhongMaterial, typeof MeshPhongMaterial>
      pointsMaterial: Object3DNode<PointsMaterial, typeof PointsMaterial>
      
      // Attributes
      bufferAttribute: Object3DNode<BufferAttribute, typeof BufferAttribute>
    }
  }
}