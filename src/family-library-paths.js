import {LEARNING_PATHS} from './family-library-paths-data.js';

const statuses = new Set(['again', 'with-help', 'ready']);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
export function pathsFor(profile) {
  return Object.hasOwn(LEARNING_PATHS, profile?.id) ? LEARNING_PATHS[profile.id] : [];
}
function findPath(profile, id) { return pathsFor(profile).find(path => path.id === id); }
function recordFor(profile, path) {
  const root = object(profile?.familyLibraryProgress) ? profile.familyLibraryProgress : {};
  const record = Object.hasOwn(root, path.id) && object(root[path.id]) ? root[path.id] : {};
  return record;
}
export function pathProgress(profile, pathId) {
  const path = findPath(profile, pathId);
  if (!path) return {index:0, startIndex:0, step:null, allReady:false, completedCount:0, statuses:{}};
  const record = recordFor(profile, path);
  const startIndex = Math.max(0, path.steps.findIndex(step => step.id === record.startStepId));
  const result = object(record.results) ? record.results : {};
  const state = Object.fromEntries(path.steps.flatMap(step => {
    const status = Object.hasOwn(result, step.id) ? result[step.id]?.status : null;
    return statuses.has(status) ? [[step.id, status]] : [];
  }));
  const reviewIndex = path.steps.findIndex((step, i) => i >= startIndex && step.id === record.reviewStepId);
  const next = reviewIndex >= 0 ? reviewIndex : path.steps.findIndex((step, i) => i >= startIndex && state[step.id] !== 'ready');
  return {index:next < 0 ? path.steps.length : next, startIndex, step:next < 0 ? null : path.steps[next], allReady:next < 0, completedCount:path.steps.filter(step => state[step.id] === 'ready').length, statuses:state};
}
function writableRecord(profile, path) {
  if (!object(profile.familyLibraryProgress)) profile.familyLibraryProgress = {};
  const existing = recordFor(profile, path);
  const results = {};
  for (const step of path.steps) {
    const item = existing.results?.[step.id];
    if (object(item) && statuses.has(item.status)) results[step.id] = {status:item.status, at:typeof item.at === 'string' ? item.at : ''};
  }
  const record = {startStepId:path.steps.some(step => step.id === existing.startStepId) ? existing.startStepId : path.steps[0]?.id, results};
  if (path.steps.some(step => step.id === existing.reviewStepId)) record.reviewStepId = existing.reviewStepId;
  profile.familyLibraryProgress[path.id] = record;
  return record;
}
export function setPathStart(profile, pathId, stepId) {
  const path = findPath(profile, pathId);
  if (!path || !path.steps.some(step => step.id === stepId)) return false;
  const record = writableRecord(profile, path);
  record.startStepId = stepId;
  // An explicit choice can reopen a completed step without erasing its earlier result.
  if (record.results[stepId]?.status === 'ready') record.reviewStepId = stepId;
  else delete record.reviewStepId;
  return true;
}
export function recordPathStep(profile, pathId, stepId, status) {
  const path = findPath(profile, pathId);
  if (!path || !path.steps.some(step => step.id === stepId) || !statuses.has(status)) return false;
  const record = writableRecord(profile, path);
  record.results[stepId] = {status, at:new Date().toISOString()};
  if (record.reviewStepId === stepId) delete record.reviewStepId;
  return true;
}

