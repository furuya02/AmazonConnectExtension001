#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { AmazonConnectExtension001Stack } from '../lib/cdk-stack';

const app = new cdk.App();
new AmazonConnectExtension001Stack(app, 'AmazonConnectExtension001Stack');
