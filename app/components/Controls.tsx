'use client';

interface ControlsProps {
  onRunCode: () => void;
  onClearMemory: () => void;
  onResetEditor: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLogLevelChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  logLevel: string;
}

export default function Controls({
  onRunCode,
  onClearMemory,
  onResetEditor,
  onFileChange,
  onLogLevelChange,
  logLevel
}: ControlsProps) {
  return (
    <div className="flex gap-2 p-2">
      <button
        onClick={onRunCode}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Run Code
      </button>
      <input
        type="file"
        onChange={onFileChange}
        className="border rounded p-1"
      />
      <button
        onClick={onClearMemory}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Memory
      </button>
      <button
        onClick={onResetEditor}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Reset Editor
      </button>
      <div className="flex items-center gap-2">
        <label>Log Level:</label>
        <select
          value={logLevel}
          onChange={onLogLevelChange}
          className="border rounded p-1"
        >
          <option value="6">Off</option>
          <option value="4">Error</option>
          <option value="1">Debug</option>
          <option value="3">Warn</option>
        </select>
      </div>
    </div>
  );
}
