import * as THREE from 'three';

// A deliberately generic, illustrative coupe. All dimensions are visual approximations.
export function createCar() {
  const root = new THREE.Group();
  const parts = [];
  const paint = new THREE.MeshPhysicalMaterial({ color: '#a5c7b1', metalness: .52, roughness: .29, clearcoat: 1, clearcoatRoughness: .2 });
  const dark = new THREE.MeshStandardMaterial({ color: '#20292a', metalness: .55, roughness: .4 });
  const steel = new THREE.MeshStandardMaterial({ color: '#a8afb0', metalness: .8, roughness: .3 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#294a4b', metalness: .2, roughness: .09, transparent: true, opacity: .72, side: THREE.DoubleSide });
  const rubber = new THREE.MeshStandardMaterial({ color: '#1b2020', roughness: .91 });
  const red = new THREE.MeshStandardMaterial({ color: '#b85439', metalness: .35, roughness: .4 });
  const leather = new THREE.MeshStandardMaterial({ color: '#555c50', roughness: .85 });
  const light = new THREE.MeshStandardMaterial({ color: '#f7f1d8', emissive: '#fff4d5', emissiveIntensity: .3 });
  const rearLight = new THREE.MeshStandardMaterial({ color: '#9d392a', emissive: '#a62216', emissiveIntensity: .3 });
  const box = (x,y,z) => new THREE.BoxGeometry(x,y,z);
  const cylinder = (r,h,n=32) => new THREE.CylinderGeometry(r,r,h,n);
  const mesh = (geo, mat, pos=[0,0,0], rot=[0,0,0]) => {
    const obj = new THREE.Mesh(geo, mat); obj.position.set(...pos); obj.rotation.set(...rot); obj.castShadow = true; obj.receiveShadow = true; return obj;
  };
  function part(name, system, position, explode, material, description, children) {
    const group = new THREE.Group(); group.position.set(...position);
    children.forEach(child => group.add(child));
    const data = { id: `p-${String(parts.length + 1).padStart(3,'0')}`, name, system, position, explode, material, description, group, hidden: false };
    group.traverse(obj => { if(obj.isMesh) obj.userData.part = data; });
    root.add(group); parts.push(data); return data;
  }
  function panel(points, width, mat) {
    const shape = new THREE.Shape(); points.forEach(([x,y],i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y)); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .025, bevelThickness: .025 });
    geo.translate(0,0,-width/2); geo.computeVertexNormals(); return mesh(geo,mat);
  }
  part('Chassis & floor pan', 'body', [0,.57,0], [0,-.45,0], 'Steel alloy', 'The structural foundation that connects the drivetrain, suspension, and passenger cell.', [mesh(box(4.1,.14,1.7),dark), mesh(box(2,.12,.36),steel,[0,.14,0])]);
  part('Front hood', 'body', [-1.48,1.02,0], [-1.05,1.5,0], 'Aluminum', 'A lightweight closure panel that protects the front-mounted engine. Lift it away to reveal the powertrain.', [panel([[-.78,-.07],[-.66,.05],[.66,.19],[.77,.08],[.71,-.04]],1.68,paint)]);
  part('Rear deck lid', 'body', [1.55,1.03,0], [1.15,1.05,0], 'Aluminum', 'Closes the rear luggage compartment and completes the coupe’s flowing silhouette.', [panel([[-.65,.08],[.45,.02],[.58,-.08],[-.65,-.05]],1.65,paint)]);
  part('Roof panel', 'body', [.22,1.77,0], [0,1.9,0], 'Aluminum', 'The curved upper panel spans the passenger compartment and joins the front and rear pillars.', [panel([[-.64,-.04],[-.5,.08],[.43,.08],[.68,-.04]],1.38,paint)]);
  part('Windshield', 'body', [-.67,1.43,0], [-.55,1.2,0], 'Laminated glass', 'Two layers of glass bonded around an interlayer form the forward-facing safety glazing.', [mesh(box(.035,.72,1.39),glass,[0,0,0],[0,0,-.65])]);
  part('Rear windshield', 'body', [1.02,1.4,0], [.55,1.2,0], 'Tempered glass', 'The sloped rear glazing provides visibility and follows the roofline into the rear deck.', [mesh(box(.035,.68,1.38),glass,[0,0,0],[0,0,.79])]);
  for (const side of [-1,1]) {
    const label = side === 1 ? 'Left' : 'Right';
    part(`${label} door`, 'body', [.04,.95,side*.88], [0,.2,side*1.4], 'Aluminum', 'A sculpted door shell with a recessed handle and lower sill. The glazing is shown as a separate component.', [panel([[-.83,-.26],[-.84,.23],[.64,.23],[.88,-.13],[.75,-.28]],.07,paint),mesh(box(.2,.035,.025),dark,[.54,.12,side*.065])]);
    part(`${label} side window`, 'body', [.12,1.44,side*.755], [0,1,side*1.2], 'Tempered glass', 'Shaped side glazing fits between the door beltline and the coupe roof.', [panel([[-.78,-.22],[-.34,.29],[.44,.29],[.86,-.22]],.025,glass)]);
    part(`${label} front fender`, 'body', [-1.5,.9,side*.89], [-.75,.45,side*.95], 'Aluminum', 'The fender frames the front wheel and helps direct air along the vehicle.', [panel([[-.73,-.16],[-.7,.15],[.67,.21],[.7,-.16],[.51,-.18],[.42,.02],[-.4,.02],[-.49,-.18]],.13,paint)]);
    part(`${label} rear quarter panel`, 'body', [1.48,.9,side*.89], [.75,.45,side*.95], 'Aluminum', 'A fixed rear body panel wraps around the wheel opening and supports the rear deck.', [panel([[-.64,-.18],[-.65,.16],[.57,.14],[.69,-.15],[.49,-.18],[.4,.02],[-.4,.02],[-.48,-.18]],.13,paint)]);
    part(`${label} side mirror`, 'body', [-.65,1.24,side*1.02], [-.25,.6,side*1.8], 'Polymer / glass', 'An aerodynamic housing carries the rear-view mirror outside the passenger cell.', [mesh(box(.22,.12,.18),paint),mesh(box(.015,.09,.14),steel,[.115,0,0])]);
    part(`${label} side sill`, 'body', [0,.62,side*.92], [0,-.2,side*1.1], 'Steel alloy', 'A longitudinal sill reinforces the door opening and the passenger compartment.', [mesh(box(2.05,.11,.12),dark)]);
  }
  part('Front bumper assembly', 'body', [-2.24,.76,0], [-1.5,0,0], 'Composite polymer', 'The front fascia integrates the intake openings, crash absorber, and lighting surrounds.', [mesh(box(.13,.25,1.79),paint),mesh(box(.145,.115,.83),dark,[-.015,-.045,0]),mesh(box(.16,.06,1.84),dark,[0,-.16,0])]);
  part('Rear bumper assembly', 'body', [2.16,.76,0], [1.5,0,0], 'Composite polymer', 'The rear fascia surrounds the diffuser and exhaust outlets.', [mesh(box(.15,.27,1.78),paint),mesh(box(.18,.1,1.6),dark,[0,-.12,0])]);
  for(const side of [-1,1]) {
    part(`${side===1?'Left':'Right'} headlight`, 'body', [-2.265,1.0,side*.61], [-1.6,.5,side*.28], 'Polycarbonate / LED', 'A compact LED light unit sits beneath a clear protective lens.', [mesh(box(.075,.085,.43),light,[0,0,0],[0,side*.1,0])]);
    part(`${side===1?'Left':'Right'} tail light`, 'body', [2.25,1.0,side*.6], [1.6,.5,side*.28], 'Polycarbonate / LED', 'Rear lighting combines braking, position, and turn indication functions.', [mesh(box(.045,.065,.48),rearLight)]);
  }
  part('Engine block', 'engine', [-1.28,.82,0], [-.7,.65,0], 'Cast aluminum', 'An illustrative six-cylinder engine block houses the cylinders and supports the rotating crankshaft.', [mesh(box(.88,.44,.72),steel),mesh(box(.81,.11,.77),dark,[0,.275,0]),...[ -.25,0,.25 ].map(x=>mesh(box(.17,.07,.57),steel,[x,.36,0]))]);
  part('Intake manifold', 'engine', [-1.24,1.15,0], [-.65,1.15,0], 'Aluminum / polymer', 'Distributes incoming air evenly across the engine cylinders.', [mesh(box(.68,.1,.22),dark),...[-.25,0,.25].map(x=>mesh(cylinder(.055,.55),steel,[x,-.06,0],[Math.PI/2,0,0]))]);
  part('Radiator & cooling fan', 'engine', [-1.98,.84,0], [-1.8,.65,0], 'Aluminum', 'Transfers heat from the coolant to passing air, assisted by an electric cooling fan.', [mesh(box(.1,.4,1.08),dark),...Array.from({length:12},(_,i)=>mesh(box(.13,.34,.025),steel,[0,0,-.48+i*.087]))]);
  part('Transmission', 'engine', [-.5,.68,0], [0,-.5,.7], 'Cast aluminum', 'Uses a set of gear ratios to match engine speed and torque to road speed.', [mesh(box(.55,.28,.34),steel),mesh(cylinder(.15,.25),dark,[.3,0,0],[0,0,Math.PI/2])]);
  part('Propeller shaft', 'engine', [.4,.58,0], [0,-.8,0], 'Steel alloy', 'A rotating shaft carries torque from the transmission to the rear differential.', [mesh(cylinder(.065,1.35),steel,[0,0,0],[0,0,Math.PI/2])]);
  part('Rear differential', 'engine', [1.4,.61,0], [1,-.45,0], 'Cast iron / steel', 'Distributes drive to the rear wheels while allowing them to rotate at different speeds.', [mesh(new THREE.SphereGeometry(.2,20,16),dark),mesh(cylinder(.055,1.4),steel,[0,0,0],[Math.PI/2,0,0])]);
  part('Exhaust system', 'engine', [.15,.43,-.35], [0,-.8,-.65], 'Stainless steel', 'Routes exhaust gases beneath the chassis through a silencer and out of the rear of the vehicle.', [mesh(cylinder(.045,3.7),steel,[0,0,0],[0,0,Math.PI/2]),mesh(box(.6,.15,.32),steel,[1.2,0,0])]);
  for(const [axle,x] of [['Front',-1.45],['Rear',1.4]]) for(const side of [-1,1]) {
    const label = `${axle} ${side===1?'left':'right'}`;
    const z=side*.98;
    const wheel = [mesh(new THREE.TorusGeometry(.335,.115,18,56),rubber),mesh(cylinder(.267,.2),steel,[0,0,0],[Math.PI/2,0,0]),mesh(cylinder(.225,.215),dark,[0,0,0],[Math.PI/2,0,0])];
    for(let i=0;i<7;i++){ const a=i*Math.PI*2/7; wheel.push(mesh(box(.047,.39,.23),steel,[0,0,0],[0,0,a])); }
    wheel.push(mesh(cylinder(.085,.245),dark,[0,0,0],[Math.PI/2,0,0]));
    part(`${label} wheel & tire`,'brakes',[x,.49,z],[x*.35,.1,side*1.6],'Rubber / aluminum','A seven-spoke alloy wheel supports a performance tire. Remove it to reveal the brake rotor and hub.',wheel);
    part(`${label} brake rotor`,'brakes',[x,.49,side*.8],[x*.35,.1,side*.85],'Cast iron','A ventilated disc converts kinetic energy to heat when the brake pads press against its faces.',[mesh(cylinder(.242,.045),steel,[0,0,0],[Math.PI/2,0,0]),mesh(cylinder(.095,.065),dark,[0,0,0],[Math.PI/2,0,0])]);
    part(`${label} brake caliper`,'brakes',[x+.18,.53,side*.8],[x*.35,.45,side*1.1],'Aluminum','Hydraulic pistons squeeze the brake pads against the rotor to slow the wheel.',[mesh(box(.13,.24,.13),red)]);
    const spring = [];
    for(let j=0;j<7;j++) spring.push(mesh(new THREE.TorusGeometry(.085,.016,7,20),steel,[0,-.18+j*.057,0],[Math.PI/2,0,0]));
    part(`${label} coilover`,'suspension',[x,.77,side*.6],[x*.3,1.2,side*.85],'Spring steel','A coil spring supports the vehicle’s weight while a damper controls suspension movement.',[mesh(cylinder(.035,.55),dark),...spring]);
    part(`${label} control arm`,'suspension',[x,.43,side*.55],[x*.25,-.5,side*.6],'Forged aluminum','Locates the wheel hub relative to the chassis while allowing controlled vertical movement.',[mesh(box(.38,.055,.53),steel)]);
    for(let j=0;j<5;j++){
      const a=j*Math.PI*2/5;
      part(`${label} wheel bolt ${j+1}`,'fasteners',[x+Math.cos(a)*.115,.49+Math.sin(a)*.115,side*1.11],[x*.35,Math.sin(a)*.3,side*2.0],'High-tensile steel','A hex-head fastener secures the wheel to the hub. Illustrative geometry; do not use this model for service specifications.',[mesh(cylinder(.026,.055,6),steel,[0,0,0],[Math.PI/2,0,0])]);
    }
  }
  for(const side of [-1,1]) {
    part(`${side===1?'Driver':'Passenger'} sport seat`,'interior',[.25,.84,side*.39],[.15,1.25,side*.7],'Leather / steel','A contoured seat provides lateral support, with a reinforced frame beneath the upholstery.',[mesh(box(.53,.15,.53),leather),mesh(box(.15,.61,.52),leather,[.23,.3,0],[0,0,.12]),mesh(box(.13,.2,.29),leather,[.27,.66,0])]);
  }
  part('Dashboard','interior',[-.55,1.12,0],[-.25,1.45,0],'Polymer / aluminum','The instrument panel carries the driving displays, ventilation, and primary cabin controls.',[mesh(box(.3,.23,1.4),dark),mesh(box(.02,.13,.31),glass,[.16,.02,.34])]);
  part('Steering wheel','interior',[-.29,1.14,.4],[-.3,1.5,1],'Leather / aluminum','Transfers the driver’s input through the steering column to the front wheels.',[mesh(new THREE.TorusGeometry(.15,.022,12,30),dark,[0,0,0],[0,Math.PI/2,0]),mesh(box(.035,.035,.26),steel),mesh(box(.035,.2,.025),steel,[0,-.04,0])]);
  return { root, parts };
}
