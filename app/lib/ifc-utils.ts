import { IfcAPI, LogLevel } from 'web-ifc';

let ifcAPI: IfcAPI | null = null;

export const initializeIFC = async () => {
  if (!ifcAPI) {
    console.log('Creating new IfcAPI instance...');
    ifcAPI = new IfcAPI();
    
    // Set WASM path using reference implementation approach
    ifcAPI.SetWasmPath("./");
    console.log('WASM path set to: ./');
    
    try {
      // Initialize using reference implementation approach
      await ifcAPI.Init();
      console.log('WASM initialization successful');
      
      // Verify WASM module
      if (ifcAPI.wasmModule) {
        console.log('WASM module loaded successfully');
        // Set debug level for detailed information
        ifcAPI.SetLogLevel(LogLevel.LOG_LEVEL_DEBUG); // Use debug level for detailed logging
      } else {
        console.error('WASM module not found after initialization');
        throw new Error('WASM module initialization failed');
      }
    } catch (error) {
      console.error('Error initializing WASM:', error);
      throw error;
    }
  }
  return ifcAPI;
};

export const createModel = async () => {
  const api = await initializeIFC();
  console.log('Initializing new model...');
  
  // Set debug log level for detailed information first
  api.SetLogLevel(LogLevel.LOG_LEVEL_DEBUG);
  
  // Create model with IFC4 schema and proper initialization
  const modelID = api.CreateModel({
    schema: "IFC4",
    name: "web-ifc-model",
    description: ["ViewDefinition [CoordinationView]"],
    authors: ["web-ifc"],
    organizations: ["web-ifc"],
    authorization: "None"
  });
  console.log('Model created with ID:', modelID);
  
  // Verify WASM functionality
  try {
    // Test getting type codes
    const realTypeCode = api.GetTypeCodeFromName("IFCREAL");
    const labelTypeCode = api.GetTypeCodeFromName("IFCLABEL");
    console.log('Type codes retrieved successfully:', {
      IFCREAL: realTypeCode,
      IFCLABEL: labelTypeCode
    });
    
    // Test schema
    const schema = api.GetModelSchema(modelID);
    console.log('Schema verification:', {
      modelID,
      schema,
      wasmModule: !!api.wasmModule
    });
    
    if (!schema) {
      throw new Error('Schema initialization failed');
    }
    
    // Test type creation with increasing verbosity
    console.log('Attempting to create IFCREAL type...');
    const realValue = 1.0;
    console.log('Type code for IFCREAL:', realTypeCode);
    console.log('Model ID:', modelID);
    console.log('Value to create:', realValue);
    
    const realType = api.CreateIfcType(modelID, realTypeCode, realValue);
    console.log('Successfully created IFCREAL type:', realType);
    
  } catch (error) {
    console.error('Initialization verification failed:', error);
    throw error;
  }
  
  return modelID;
};

export const closeModel = async (modelID: number) => {
  if (ifcAPI) {
    ifcAPI.CloseModel(modelID);
  }
};

export const clearMemory = () => {
  if (ifcAPI) {
    ifcAPI.CloseModel(0);
    ifcAPI.wasmModule._free(0);
  }
};

export const setLogLevel = (level: string) => {
  if (ifcAPI) {
    ifcAPI.SetLogLevel(parseInt(level));
  }
};
