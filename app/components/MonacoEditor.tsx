'use client';

import { Editor, loader } from '@monaco-editor/react';
import { Dispatch, SetStateAction, useEffect } from 'react';

// Configure Monaco Editor CDN path
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
  }
});

interface MonacoEditorProps {
  onChange: Dispatch<SetStateAction<string>>;
  value: string;
}

export default function MonacoEditor({ onChange, value }: MonacoEditorProps) {
  // Monaco editor is now configured via loader.config
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="python"
      theme="vs-dark"
      value={value}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        wrappingStrategy: 'advanced'
      }}
    />
  );
}
