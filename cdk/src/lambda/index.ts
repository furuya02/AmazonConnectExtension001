import AWS = require("aws-sdk");
if(process.env.IsLocal=='Yes') {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'developer'});
  AWS.config.update({region:'ap-northeast-1'});
}

const s3 = new AWS.S3();
const settingBucket = process.env.SETTING_BUCKET!;
const settingFile = process.env.SETTING_FILE!;
 
exports.handler = async (event: any) => {
  console.log(JSON.stringify(event));

  // オペレーション時間の取得
  let data = await s3.getObject( {
      Bucket: settingBucket,
      Key: settingFile
  }).promise();

   if (!data || !data.Body) {
    throw new Error("Read error " + settingFile);
  }
  let lines = data.Body.toString().split('\n');

  // コメント、余分な空白、及び、無効（空白）行の削除
  lines = lines.map( l => l.replace(/#.*$/, '').replace(/\s+$/, '')).filter( l => l != '');
  // 時間内かどうかのチェック
  return { inTime: CheckInTime(lines) };
}
 
function CheckInTime(lines: string[]) {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  // 現在日時
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const week = now.getDay();
  const hour = now.getHours();
  const miniute = now.getMinutes();

  //--------------------------------
  // 設定取得
  //--------------------------------
  // 曜日指定の抽出 金,09:00,19:00
  const weeks = lines.filter(l => 0 < weekdays.indexOf(l.split(',')[0]));
  // 祝日指定の抽出 yyyy/mm/dd
  let holidays = lines.filter(l => l.split(',')[0].split('/').length == 3);
  // 祝日指定の抽出  mm/dd 
  holidays = holidays.concat(lines.filter(l => l.split(',')[0].split('/').length == 2).map(date => { return year + '/' + date }));

  //--------------------------------
  // 曜日指定のチェック
  //--------------------------------
  let flg = false; // デフォルトで時間外（設定がない場合時間外となるため）
  const nowMiniute = (hour * 60 + miniute ); // 現在の分
  // 時間文字列を分に変換する　01:01 => 61
  const getMiniute = function(timeStr: string) {
    const [h,m] = timeStr.split(':');
    return Number(h) * 60 + Number(m);
  };
  weeks.forEach( line => {
    const [weekStr,start,end] = line.split(',');
    if(week == weekdays.indexOf(weekStr)) { // 当該曜日の設定
      // 営業時間内かどうかのチェック
      if(getMiniute(start) <= nowMiniute && nowMiniute <= getMiniute(end)){
        flg = true;
      }
    }
  });
  // 曜日指定で時間外の場合は、祝日に関係なく時間外となる
  if(!flg) {
    return false;
  }

  //--------------------------------
  // 祝日指定のチェック
  //--------------------------------
  flg = true; // デフォルトで時間内（設定がない場合時間内となるため）
  holidays.forEach( l => {
    const [y,m,d] = l.split('/');
    if(year == Number(y) && month == Number(m) && day == Number(d)) {
      flg = false;
    }
  })
  return flg;
}
