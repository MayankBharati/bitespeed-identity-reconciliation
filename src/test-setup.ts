import express from 'express';

// Simple test to verify TypeScript setup
const testSetup = () => {
  const app = express();
  console.log('✅ Express imported successfully');
  
  interface TestInterface {
    message: string;
    status: boolean;
  }
  
  const testObject: TestInterface = {
    message: 'TypeScript setup is working!',
    status: true
  };
  
  console.log('✅ TypeScript compilation successful');
  console.log('✅ Interface definitions working');
  console.log(`Test result: ${JSON.stringify(testObject, null, 2)}`);
  
  return testObject;
};

if (require.main === module) {
  testSetup();
}
