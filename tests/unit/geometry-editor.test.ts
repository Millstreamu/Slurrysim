import { describe, expect, it } from 'vitest';
import { GEOMETRIES, validateGeometry } from '../../src/simulation/geometry';
import { GeometryEditorState } from '../../src/ui/geometry-editor';

describe('GeometryEditorState', () => {
  it('adds, moves, deletes, and round-trips schema data', () => {
    const editor = new GeometryEditorState(GEOMETRIES['simple-slope']);
    editor.add({ x: 0.5, y: 0.8 });
    editor.updateSelected({ x: 0.7, y: 0.84 });
    expect(editor.snapshot.geometry.floor[1]).toEqual({ x: 0.7, y: 0.84 });
    editor.deleteSelected();
    const restored = JSON.parse(JSON.stringify(editor.snapshot.geometry));
    expect(restored).toEqual(editor.snapshot.geometry);
    expect(validateGeometry(restored)).toEqual([]);
  });

  it('undoes and redoes mutations and clears redo after a new edit', () => {
    const editor = new GeometryEditorState(GEOMETRIES.classic);
    editor.add({ x: 0.6, y: 0.8 });
    editor.undo();
    expect(editor.snapshot.geometry.floor).toHaveLength(5);
    editor.redo();
    expect(editor.snapshot.geometry.floor).toHaveLength(6);
    editor.undo();
    editor.add({ x: 0.65, y: 0.82 });
    editor.redo();
    expect(editor.snapshot.geometry.floor).toHaveLength(6);
  });

  it('resets to a preset as an undoable mutation', () => {
    const editor = new GeometryEditorState(GEOMETRIES.classic);
    editor.reset(GEOMETRIES.asymmetric);
    expect(editor.snapshot.geometry.id).toBe('asymmetric');
    editor.undo();
    expect(editor.snapshot.geometry.id).toBe('classic');
  });
});
