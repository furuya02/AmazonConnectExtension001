#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AmazonConnectExtension001Stack } from "../lib/cdk-stack";

const app = new cdk.App();
new AmazonConnectExtension001Stack(app, "AmazonConnectExtension001Stack");
