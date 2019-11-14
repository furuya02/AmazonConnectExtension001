import cdk = require('@aws-cdk/core');
import * as lambda  from '@aws-cdk/aws-lambda';
import * as s3  from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';

// 識別するためのタグ
const tag = "connect-ex-opetime";
const settingFile = "OperationTime.txt";
// Lambdaのタイムゾーン
const timeZone = 'Asia/Tokyo';

export class AmazonConnectExtension001Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 設定ファイルを保存するバケット名
    const bucketName = tag + "-setting-bucket-" + this.account;

    //設定ファイル保存バケット
    const settingBucket = new s3.Bucket(this, tag + '-settingBucket', {
      bucketName: bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })
  
    // 営業時間判定ファンクション
    const opeTimeFunction = new lambda.Function(this, tag + '-function', {
      functionName: tag + "-function",
      code: lambda.Code.asset('src/lambda'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      timeout: cdk.Duration.seconds(3),
      environment: {
          SETTING_BUCKET: settingBucket.bucketName,
          SETTING_FILE: settingFile,
          TZ: timeZone
      }
    });
  
    // 設定ファイルのRead権限追加
    opeTimeFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: [settingBucket.bucketArn + "/" + settingFile],
      actions: ['s3:GetObject'] }
    ));
  
    // 出力に設定ファイル用バケット名を表示
    new cdk.CfnOutput(this, "SettingBucket", {
      value: settingBucket.bucketName
    });
  }
}

 