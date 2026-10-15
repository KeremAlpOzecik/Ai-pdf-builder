import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:90000,use:{baseURL:'http://127.0.0.1:5173',headless:true,viewport:{width:1440,height:1000},launchOptions:{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}},workers:1,reporter:'list'});
