// Monaco editor configuration for Next.js
export const configureMonaco = () => {
  if (typeof window !== 'undefined') {
    window.MonacoEnvironment = {
      getWorkerUrl: function (_moduleId: string, label: string) {
        let basePath = '/monaco-editor/min/vs';
        
        if (label === 'typescript' || label === 'javascript') {
          return `${basePath}/language/typescript/ts.worker.js`;
        }
        return `${basePath}/editor/editor.worker.js`;
      },
    };
  }
};
