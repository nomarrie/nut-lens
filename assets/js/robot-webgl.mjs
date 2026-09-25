const MODEL_SCALE = 0.85;
const GLB_MAGIC = 0x46546c67;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BINARY_CHUNK = 0x004e4942;

const ACCESSOR_COMPONENTS = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
};

const COMPONENT_ARRAYS = {
  5121: Uint8Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array,
};

const INDEX_TYPES = {
  5121: 0x1401,
  5123: 0x1403,
  5125: 0x1405,
};

const REACTION_DURATION = 1100;
const HOVER_REACTION_COOLDOWN = 2400;

const VERTEX_SHADER = `#version 300 es
in vec3 aPosition;
in vec3 aNormal;

uniform mat4 uViewProjection;
uniform mat4 uModel;
uniform mat3 uNormalMatrix;

out vec3 vNormal;
out vec3 vWorldPosition;

void main() {
  vec4 worldPosition = uModel * vec4(aPosition, 1.0);
  vWorldPosition = worldPosition.xyz;
  vNormal = normalize(uNormalMatrix * aNormal);
  gl_Position = uViewProjection * worldPosition;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec4 uBaseColor;
uniform vec3 uEmissive;
uniform vec3 uCameraPosition;

in vec3 vNormal;
in vec3 vWorldPosition;

out vec4 outputColor;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 keyLight = normalize(vec3(0.78, 0.72, 0.54));
  vec3 fillLight = normalize(vec3(-0.3, 0.15, 0.94));
  vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);

  float diffuse = max(dot(normal, keyLight), 0.0);
  float fill = max(dot(normal, fillLight), 0.0) * 0.18;
  float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.5) * 0.14;
  vec3 litColor = uBaseColor.rgb * (0.42 + diffuse * 0.52 + fill + rim);
  vec3 linearColor = litColor + uEmissive;

  outputColor = vec4(pow(linearColor, vec3(1.0 / 2.2)), uBaseColor.a);
}
`;

function multiplyMat4(a, b) {
  const result = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      result[(column * 4) + row] =
        a[row] * b[column * 4]
        + a[4 + row] * b[(column * 4) + 1]
        + a[8 + row] * b[(column * 4) + 2]
        + a[12 + row] * b[(column * 4) + 3];
    }
  }
  return result;
}

function translationMat4(x = 0, y = 0, z = 0) {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1,
  ]);
}

function rotationYMat4(angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return new Float32Array([
    cosine, 0, -sine, 0,
    0, 1, 0, 0,
    sine, 0, cosine, 0,
    0, 0, 0, 1,
  ]);
}

function rotationZMat4(angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return new Float32Array([
    cosine, sine, 0, 0,
    -sine, cosine, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

function scaleMat4(x = 1, y = x, z = x) {
  return new Float32Array([
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1,
  ]);
}

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

export function getRobotPose(timeMs, reactionStartedAt = -Infinity, reducedMotion = false) {
  if (reducedMotion) {
    return {
      translationY: -0.02,
      yaw: 0,
      roll: 0,
      scaleX: 1,
      scaleY: 1,
      eyeIntensity: 1,
      reactionProgress: 1,
    };
  }

  const elapsed = timeMs / 1000;
  const reactionProgress = clamp01((timeMs - reactionStartedAt) / REACTION_DURATION);
  const isReacting = reactionProgress < 1;
  const idleBob = Math.sin(elapsed * 1.7) * 0.022;
  const idleYaw = Math.sin(elapsed * 0.72) * 0.035;
  const breathing = 1 + (Math.sin(elapsed * 1.25) * 0.007);

  let reactionLift = 0;
  let reactionYaw = 0;
  let reactionRoll = 0;
  let reactionScaleX = 1;
  let reactionScaleY = 1;

  if (isReacting && reactionProgress < 0.16) {
    const anticipation = reactionProgress / 0.16;
    reactionLift = -0.025 * anticipation;
    reactionRoll = -0.06 * anticipation;
    reactionScaleX = 1 + (0.045 * anticipation);
    reactionScaleY = 1 - (0.075 * anticipation);
  } else if (isReacting && reactionProgress < 0.58) {
    const jumpProgress = (reactionProgress - 0.16) / 0.42;
    const jumpArc = Math.sin(jumpProgress * Math.PI);
    reactionLift = jumpArc * 0.13;
    reactionYaw = Math.sin(jumpProgress * Math.PI) * 0.48;
    reactionRoll = Math.sin(jumpProgress * Math.PI * 2) * 0.08;
    reactionScaleX = 1 - (jumpArc * 0.025);
    reactionScaleY = 1 + (jumpArc * 0.04);
  } else if (isReacting) {
    const settleProgress = (reactionProgress - 0.58) / 0.42;
    const settleStrength = Math.sin(settleProgress * Math.PI) * Math.exp(-settleProgress * 2);
    const settleWobble = Math.sin(settleProgress * Math.PI * 3)
      * Math.exp(-settleProgress * 3);
    reactionLift = -0.018 * settleStrength;
    reactionYaw = 0.14 * settleWobble;
    reactionRoll = 0.06 * settleWobble;
    reactionScaleX = 1 + (0.035 * settleStrength);
    reactionScaleY = 1 - (0.06 * settleStrength);
  }

  const blinkPhase = (elapsed + 0.8) % 4.6;
  const blink = blinkPhase < 0.12
    ? 1 - (Math.sin((blinkPhase / 0.12) * Math.PI) * 0.94)
    : 1;
  const reactionGlow = isReacting
    ? 1 + (Math.sin(reactionProgress * Math.PI) * 0.7)
    : 1;

  return {
    translationY: -0.02 + idleBob + reactionLift,
    yaw: idleYaw + reactionYaw,
    roll: reactionRoll,
    scaleX: breathing * reactionScaleX,
    scaleY: breathing * reactionScaleY,
    eyeIntensity: blink * reactionGlow,
    reactionProgress,
  };
}

function mat4FromTrs(translation = [0, 0, 0], rotation = [0, 0, 0, 1], scale = [1, 1, 1]) {
  const [x, y, z, w] = rotation;
  const [sx, sy, sz] = scale;
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;

  return new Float32Array([
    (1 - (yy + zz)) * sx,
    (xy + wz) * sx,
    (xz - wy) * sx,
    0,
    (xy - wz) * sy,
    (1 - (xx + zz)) * sy,
    (yz + wx) * sy,
    0,
    (xz + wy) * sz,
    (yz - wx) * sz,
    (1 - (xx + yy)) * sz,
    0,
    translation[0],
    translation[1],
    translation[2],
    1,
  ]);
}

function perspectiveMat4(fieldOfView, aspect, near, far) {
  const f = 1 / Math.tan(fieldOfView / 2);
  const rangeInverse = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInverse, -1,
    0, 0, near * far * 2 * rangeInverse, 0,
  ]);
}

function lookAtMat4(eye, target, up) {
  let zx = eye[0] - target[0];
  let zy = eye[1] - target[1];
  let zz = eye[2] - target[2];
  let length = Math.hypot(zx, zy, zz) || 1;
  zx /= length;
  zy /= length;
  zz /= length;

  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  length = Math.hypot(xx, xy, xz) || 1;
  xx /= length;
  xy /= length;
  xz /= length;

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
    1,
  ]);
}

function normalMat3(matrix) {
  const a00 = matrix[0];
  const a01 = matrix[1];
  const a02 = matrix[2];
  const a10 = matrix[4];
  const a11 = matrix[5];
  const a12 = matrix[6];
  const a20 = matrix[8];
  const a21 = matrix[9];
  const a22 = matrix[10];
  const b01 = (a22 * a11) - (a12 * a21);
  const b11 = (-a22 * a10) + (a12 * a20);
  const b21 = (a21 * a10) - (a11 * a20);
  const determinant = (a00 * b01) + (a01 * b11) + (a02 * b21);
  const inverse = determinant ? 1 / determinant : 1;

  return new Float32Array([
    b01 * inverse,
    ((-a22 * a01) + (a02 * a21)) * inverse,
    ((a12 * a01) - (a02 * a11)) * inverse,
    b11 * inverse,
    ((a22 * a00) - (a02 * a20)) * inverse,
    ((-a12 * a00) + (a02 * a10)) * inverse,
    b21 * inverse,
    ((-a21 * a00) + (a01 * a20)) * inverse,
    ((a11 * a00) - (a01 * a10)) * inverse,
  ]);
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Shader WebGL gagal dikompilasi.';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Program WebGL gagal ditautkan.';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

export function parseGlb(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  if (view.getUint32(0, true) !== GLB_MAGIC) {
    throw new Error('Berkas model bukan GLB yang valid.');
  }
  if (view.getUint32(4, true) !== 2) {
    throw new Error('Hanya GLB versi 2 yang didukung.');
  }

  const declaredLength = view.getUint32(8, true);
  if (declaredLength > arrayBuffer.byteLength) {
    throw new Error('Berkas GLB tidak lengkap.');
  }

  let json = null;
  let binary = null;
  let offset = 12;

  while (offset + 8 <= declaredLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;

    if (chunkEnd > declaredLength) throw new Error('Chunk GLB tidak lengkap.');

    if (chunkType === GLB_JSON_CHUNK) {
      const text = new TextDecoder().decode(new Uint8Array(arrayBuffer, chunkStart, chunkLength));
      json = JSON.parse(text.replace(/\u0000+$/g, '').trim());
    }
    if (chunkType === GLB_BINARY_CHUNK) {
      binary = new Uint8Array(arrayBuffer, chunkStart, chunkLength);
    }

    offset = chunkEnd;
  }

  if (!json || !binary) throw new Error('GLB tidak memiliki data scene yang lengkap.');
  return { json, binary };
}

function readAccessor(model, accessorIndex) {
  const accessor = model.json.accessors[accessorIndex];
  const bufferView = model.json.bufferViews[accessor.bufferView];
  const ArrayType = COMPONENT_ARRAYS[accessor.componentType];
  const components = ACCESSOR_COMPONENTS[accessor.type];

  if (!ArrayType || !components || bufferView.byteStride) {
    throw new Error('Format accessor GLB belum didukung viewer ini.');
  }

  const byteOffset =
    model.binary.byteOffset
    + (bufferView.byteOffset || 0)
    + (accessor.byteOffset || 0);
  return {
    accessor,
    values: new ArrayType(model.binary.buffer, byteOffset, accessor.count * components),
  };
}

function uploadAttribute(gl, location, accessorData) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, accessorData.values, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(
    location,
    ACCESSOR_COMPONENTS[accessorData.accessor.type],
    accessorData.accessor.componentType,
    accessorData.accessor.normalized || false,
    0,
    0,
  );
  return buffer;
}

const MATERIAL_COLORS = {
  Material: [0.306, 0.412, 0.192, 1],
  "Material.001": [0.867, 0.922, 0.616, 1],
  "Material.002": [0.122, 0.129, 0.094, 1],
  "NutLens.Limbs": [0.486, 0.502, 0.420, 1],
};

function createDrawables(gl, program, model) {
  const positionLocation = gl.getAttribLocation(program, 'aPosition');
  const normalLocation = gl.getAttribLocation(program, 'aNormal');
  const scene = model.json.scenes[model.json.scene || 0];

  return scene.nodes.flatMap((nodeIndex) => {
    const node = model.json.nodes[nodeIndex];
    if (node.mesh === undefined) return [];

    const nodeMatrix = node.matrix
      ? new Float32Array(node.matrix)
      : mat4FromTrs(node.translation, node.rotation, node.scale);
    const mesh = model.json.meshes[node.mesh];

    return mesh.primitives.map((primitive) => {
      const vertexArray = gl.createVertexArray();
      gl.bindVertexArray(vertexArray);
      const buffers = [];
      buffers.push(uploadAttribute(gl, positionLocation, readAccessor(model, primitive.attributes.POSITION)));
      buffers.push(uploadAttribute(gl, normalLocation, readAccessor(model, primitive.attributes.NORMAL)));

      const indexData = readAccessor(model, primitive.indices);
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData.values, gl.STATIC_DRAW);
      buffers.push(indexBuffer);
      gl.bindVertexArray(null);

      const material = model.json.materials?.[primitive.material] || {};
      const pbr = material.pbrMetallicRoughness || {};

      return {
        vertexArray,
        buffers,
        nodeMatrix,
        count: indexData.accessor.count,
        indexType: INDEX_TYPES[indexData.accessor.componentType],
        baseColor:
          MATERIAL_COLORS[material.name] ??
          pbr.baseColorFactor ??
          [0.8, 0.8, 0.8, 1],
        emissive: material.emissiveFactor || [0, 0, 0],
      };
    });
  });
}

export function createRobotViewer(canvas, {
  modelUrl = 'assets/models/robot.glb?v=2',
  onReady = () => {},
  onError = () => {},
} = {}) {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
    premultipliedAlpha: true,
  });

  if (!gl) {
    onError(new Error('WebGL2 tidak tersedia.'));
    return {
      setActive() {},
      react() {},
      destroy() {},
    };
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const cameraPosition = new Float32Array([4.15, 0.02, 1.05]);
  const program = createProgram(gl);
  const uniforms = {
    viewProjection: gl.getUniformLocation(program, 'uViewProjection'),
    model: gl.getUniformLocation(program, 'uModel'),
    normalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
    baseColor: gl.getUniformLocation(program, 'uBaseColor'),
    emissive: gl.getUniformLocation(program, 'uEmissive'),
    cameraPosition: gl.getUniformLocation(program, 'uCameraPosition'),
  };

  let drawables = [];
  let active = false;
  let destroyed = false;
  let loaded = false;
  let loadingPromise = null;
  let frameId = null;
  let previousTime = 0;
  let responseStartedAt = -Infinity;
  let lastHoverReactionAt = -Infinity;
  let currentYaw = -0.06;
  let currentTilt = 0;
  let targetYaw = -0.06;
  let targetTilt = 0;

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0);
  gl.useProgram(program);
  gl.uniform3fv(uniforms.cameraPosition, cameraPosition);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1.4 : 1.75);
    const width = Math.max(1, Math.round(rect.width * pixelRatio));
    const height = Math.max(1, Math.round(rect.height * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    gl.viewport(0, 0, width, height);
  }

  function draw(time = 0) {
    if (!loaded || destroyed) return;

    resize();
    const delta = Math.min((time - previousTime) / 1000 || 0, 0.05);
    previousTime = time;
    const smoothing = 1 - Math.exp(-delta * 8);
    currentYaw += (targetYaw - currentYaw) * smoothing;
    currentTilt += (targetTilt - currentTilt) * smoothing;

    const pose = getRobotPose(time, responseStartedAt, reducedMotion.matches);
    const rootTranslation = translationMat4(0, pose.translationY, 0);
    const rootYaw = rotationYMat4(currentYaw + pose.yaw);
    const rootTilt = rotationZMat4(currentTilt + pose.roll);
    const rootScale = scaleMat4(
      pose.scaleX * MODEL_SCALE,
      pose.scaleY * MODEL_SCALE,
      pose.scaleX * MODEL_SCALE,
    );
    const rootMatrix = multiplyMat4(
      rootTranslation,
      multiplyMat4(rootYaw, multiplyMat4(rootTilt, rootScale)),
    );

    const projection = perspectiveMat4(Math.PI / 5.2, canvas.width / canvas.height, 0.1, 20);
    const view = lookAtMat4(cameraPosition, [0, -0.06, 0], [0, 1, 0]);
    const viewProjection = multiplyMat4(projection, view);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniformMatrix4fv(uniforms.viewProjection, false, viewProjection);

    drawables.forEach((drawable) => {
      const modelMatrix = multiplyMat4(rootMatrix, drawable.nodeMatrix);
      gl.uniformMatrix4fv(uniforms.model, false, modelMatrix);
      gl.uniformMatrix3fv(uniforms.normalMatrix, false, normalMat3(modelMatrix));
      gl.uniform4fv(uniforms.baseColor, drawable.baseColor);
      gl.uniform3f(
        uniforms.emissive,
        drawable.emissive[0] * pose.eyeIntensity,
        drawable.emissive[1] * pose.eyeIntensity,
        drawable.emissive[2] * pose.eyeIntensity,
      );
      gl.bindVertexArray(drawable.vertexArray);
      gl.drawElements(gl.TRIANGLES, drawable.count, drawable.indexType, 0);
    });

    gl.bindVertexArray(null);

    if (active && !reducedMotion.matches && !document.hidden) {
      frameId = requestAnimationFrame(draw);
    } else {
      frameId = null;
    }
  }

  async function load() {
    if (loaded || loadingPromise) return loadingPromise;

    loadingPromise = fetch(modelUrl, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`Model gagal dimuat (${response.status}).`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => {
        const model = parseGlb(arrayBuffer);
        drawables = createDrawables(gl, program, model);
        loaded = true;
        responseStartedAt = reducedMotion.matches ? -Infinity : performance.now();
        canvas.dataset.robotReady = 'true';
        canvas.dataset.robotMotion = 'interactive';
        draw(performance.now());
        onReady();
      })
      .catch((error) => {
        canvas.dataset.robotError = 'true';
        onError(error);
      });

    return loadingPromise;
  }

  function requestFrame() {
    if (frameId === null && loaded && !destroyed) {
      frameId = requestAnimationFrame(draw);
    }
  }

  function setActive(nextActive) {
    active = Boolean(nextActive);
    if (active) {
      load().then(requestFrame);
      return;
    }
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
  }

  function startReaction({ force = false } = {}) {
    if (reducedMotion.matches || !loaded) return;

    const now = performance.now();
    if (!force && now - lastHoverReactionAt < HOVER_REACTION_COOLDOWN) return;

    responseStartedAt = now;
    lastHoverReactionAt = now;
    requestFrame();
  }

  function react() {
    startReaction({ force: true });
  }

  function handlePointerEnter() {
    startReaction();
  }

  function handlePointerMove(event) {
    if (reducedMotion.matches) return;
    const rect = canvas.getBoundingClientRect();
    const pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    targetYaw = -0.06 - (pointerX * 0.18);
    targetTilt = -pointerY * 0.08;
  }

  function resetPointer() {
    targetYaw = -0.06;
    targetTilt = 0;
  }

  function handleVisibility() {
    if (document.hidden && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    } else if (active) {
      previousTime = performance.now();
      requestFrame();
    }
  }

  const resizeObserver = new ResizeObserver(requestFrame);
  resizeObserver.observe(canvas);
  canvas.addEventListener('pointerenter', handlePointerEnter);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerleave', resetPointer);
  document.addEventListener('visibilitychange', handleVisibility);
  reducedMotion.addEventListener?.('change', requestFrame);
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    canvas.dataset.robotError = 'true';
    onError(new Error('Konteks WebGL terputus.'));
  });

  return {
    setActive,
    react,
    destroy() {
      destroyed = true;
      setActive(false);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', resetPointer);
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotion.removeEventListener?.('change', requestFrame);
      drawables.forEach((drawable) => {
        gl.deleteVertexArray(drawable.vertexArray);
        drawable.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
      });
      gl.deleteProgram(program);
    },
  };
}
