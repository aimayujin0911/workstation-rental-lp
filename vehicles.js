/*
 * 車両データ（出典：ロジレント https://logirent.jp ／ 2026-10-21 時点の掲載内容）
 * ------------------------------------------------------------
 * LINEUP  … ロジレント「取扱いトラック一覧」＋「料金案内」の表。料金はいずれも参考価格（目安）
 * VACANCY_API … ロジレントの空き車両検索と同じ Google Apps Script。
 *               ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&vehicleType=…&location=… で
 *               { status:'ok', data:[{ id, type, maker, modelCode, location, payload, license,
 *                 priceDay, priceMonth, priceLease, note }] } が返る
 */
window.VACANCY_API = 'https://script.google.com/macros/s/AKfycbyFAcN15D1nVw4pLwuUg7iOWO2aywn70LbekbofVCEGXAQUqpHrNpPGZsAk7buXDvKY_w/exec';

window.LOCATIONS = ['町田営業所', '千葉営業所', '相模原営業所', '埼玉営業所'];

// form = お問い合わせフォームの車格チェックの値
window.LINEUP = [
  { type: '1tトラック',  tag: 'SMALL',        body: 'small',   form: '1t',
    makers: 'トヨタ トヨエース / いすゞ エルフ100 ほか', payload: '1,000kg',
    use: '小口配送・集配・少量荷物の運搬に',
    priceDay: 12000, priceMonth: 150000, priceLease: 50000 },
  { type: '2tトラック',  tag: 'SMALL',        body: 'box',     form: '2t',
    makers: '三菱 キャンター / いすゞ エルフ ほか', payload: '2,000kg',
    use: '引っ越し・小口配送・農産物輸送など',
    priceDay: 15000, priceMonth: 180000, priceLease: 85000 },
  { type: '4tトラック',  tag: '人気No.1',     body: 'wing',    form: '4t', popular: true,
    makers: '日野 レンジャー / 三菱 ファイター ほか', payload: '3,750kg',
    use: '精密機器・家具・食品などの積み下ろし',
    priceDay: 25000, priceMonth: 350000, priceLease: 150000 },
  { type: '4t冷凍車',    tag: 'REFRIGERATED', body: 'cold',    form: '4t冷蔵・冷凍',
    makers: 'いすゞ フォワード / 日野 レンジャー ほか', payload: '2,500kg',
    use: '生鮮食品・医薬品など温度管理が必要な輸送',
    priceDay: 45000, priceMonth: 450000, priceLease: 250000 },
  { type: '10tトラック', tag: 'LARGE',        body: 'large',   form: '10t',
    makers: 'いすゞ ギガ / 日野 プロフィア ほか', payload: '9,200kg',
    use: '長距離輸送・大量貨物・建設資材の大量搬送',
    priceDay: 40000, priceMonth: 600000, priceLease: 280000 },
  { type: 'トレーラ',    tag: 'TRAILER',      body: 'trailer', form: 'トレーラ',
    makers: '三菱ふそう スーパーグレート ほか', payload: '24,000kg',
    use: '大型機械・コンテナ輸送・長距離大量輸送に',
    priceDay: 50000, priceMonth: 650000, priceLease: 350000 }
];
