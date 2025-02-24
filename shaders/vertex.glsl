#include simplex4d.glsl;
attribute vec3 tangent;
varying vec2 vUv;

uniform float uTime;
uniform float uPositionStrength;
uniform float uPositionFrequency;
uniform float uTimeFrequency;

uniform float uSmallWavePositionFrequency;
uniform float uSmallWaveTimeFrequency;
uniform float uSmallWavePositionStrength;

float distortion(vec3 position) {
    vec3 wrappedPosition = position;
    wrappedPosition += snoise(vec4(position*uPositionFrequency, uTime*uTimeFrequency))*uPositionStrength;
    return snoise(vec4(wrappedPosition*uSmallWavePositionFrequency, uTime*uSmallWaveTimeFrequency))*uSmallWavePositionStrength;
}

void main() {
   vec3 bitangent = cross(tangent, normal);
   float shift = 0.7;
   vec3 A = csm_Position + tangent * shift;
   vec3 B = csm_Position - bitangent * shift;

   float blob = distortion(csm_Position);
   csm_Position += blob*normal;
   A += distortion(A)*normal;
   B += distortion(B)*normal;
   vec3 finalA = normalize(A-csm_Position);
   vec3 finalB = normalize(B-csm_Position);
   csm_Normal = -cross(finalA, finalB);

   vUv = uv;
}
