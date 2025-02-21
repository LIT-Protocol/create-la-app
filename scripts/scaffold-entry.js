#!/usr/bin/env node
import { scaffold } from "./scaffold.js";

// Get project name from command line arguments
const projectName = process.argv[2];
scaffold(projectName);