/*
 * 車両一覧データ
 * ------------------------------------------------------------
 * ★ 現在はすべて「サンプル」です。実在庫をいただいたらこの配列を差し替えてください。
 *   SAMPLE_MODE を false にすると、セクション上の「サンプル表示中」の注記が消えます。
 *
 * category : '2t' | '2tc' | '4t' | '4tc' | 'dump' | '10t'   （絞り込みタブ・イラストに使用）
 * body     : 'box' | 'cold' | 'dump' | 'flat' | 'wing'       （イラストの形）
 * status   : 'available'（空車）| 'soon'（近日空き）| 'rented'（貸出中）
 * image    : 実車写真のパス（任意）。空ならイラストを表示
 */
window.SAMPLE_MODE = true;

window.VEHICLES = [
  { id: 'S-201', category: '2t',   body: 'box',  name: '2t ロング 箱車',     maker: 'いすゞ エルフ',      year: 2019, payload: '2,000kg', license: '準中型', location: '町田',   features: ['パワーゲート', 'ロング'],      price: 70000,  status: 'available', image: '' },
  { id: 'S-202', category: '2t',   body: 'flat', name: '2t ショート 平ボディ', maker: '三菱ふそう キャンター', year: 2018, payload: '2,000kg', license: '準中型', location: '相模原', features: ['ショート', 'AT'],              price: 75000,  status: 'soon',      image: '' },
  { id: 'S-211', category: '2tc',  body: 'cold', name: '2t 冷凍車',          maker: 'トヨタ ダイナ',       year: 2020, payload: '1,850kg', license: '準中型', location: '千葉',   features: ['-30℃', 'スタンバイ'],         price: 150000, status: 'available', image: '' },
  { id: 'S-401', category: '4t',   body: 'box',  name: '4t 箱車',            maker: '日野 レンジャー',     year: 2017, payload: '3,500kg', license: '中型',   location: '町田',   features: ['ラッシング', '格納ゲート'],   price: 90000,  status: 'available', image: '' },
  { id: 'S-402', category: '4t',   body: 'wing', name: '4t ウイング',        maker: 'いすゞ フォワード',   year: 2019, payload: '3,300kg', license: '中型',   location: '埼玉',   features: ['ウイング', 'ベッド付'],       price: 120000, status: 'rented',    image: '' },
  { id: 'S-411', category: '4tc',  body: 'cold', name: '4t 冷凍車',          maker: 'いすゞ フォワード',   year: 2018, payload: '2,900kg', license: '中型',   location: '町田',   features: ['-30℃', '2室'],               price: 241352, status: 'available', image: '' },
  { id: 'S-501', category: 'dump', body: 'dump', name: '4t ダンプ',          maker: '日野 レンジャー',     year: 2016, payload: '3,600kg', license: '中型',   location: '相模原', features: ['土砂禁', '電動コボレーン'],   price: 250000, status: 'soon',      image: '' },
  { id: 'S-1001', category: '10t', body: 'wing', name: '10t ウイング',       maker: '日野 プロフィア',     year: 2017, payload: '13,500kg', license: '大型',  location: '千葉',   features: ['ウイング', 'エアサス'],       price: 250000, status: 'available', image: '' },
  { id: 'S-1002', category: '10t', body: 'box',  name: '10t 箱車',           maker: 'いすゞ ギガ',         year: 2015, payload: '13,000kg', license: '大型',  location: '町田',   features: ['ラッシング', 'エアサス'],     price: 260000, status: 'rented',    image: '' }
];
