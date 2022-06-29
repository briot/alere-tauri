module.exports = {
   preset: "ts-jest",
   setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
   moduleDirectories: ["node_modules", "src"],
   moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
   modulePathIgnorePatterns: [".*.scss", "<rootDir>/src-tauri"],
   moduleNameMapper : {
      "\\.scss$": "<rootDir>/src/styleMock.js",
      "^@/(.*)$": ["<rootDir>/src/$1"]
   }
};

