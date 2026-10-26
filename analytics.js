/*
 * GA4 計測
 * ------------------------------------------------------------
 * GA4_ID に測定ID（G-XXXXXXXXXX）を入れると計測が始まる。空のままなら何も読み込まない。
 * 流入元はハコプロ広告リンクの utm_*（utm_content=枠名）で GA4 側が自動で判別する。
 *
 * 送るイベント（GA4 で「キーイベント」に指定するのは generate_lead）
 *   generate_lead    … 問い合わせフォーム送信（車格・期間つき）
 *   vehicle_search   … 空き車両検索の実行（車種・営業所・件数）
 *   select_vehicle   … 車両カード／ラインナップから「問い合わせる」
 *   click_tel        … 電話番号タップ（どこの番号か）
 *   cta_click        … 車両一覧・問い合わせへのボタン（どのボタンか）
 */
(function () {
  var GA4_ID = ''; // 例: 'G-XXXXXXXXXX'

  window.track = function () {};
  if (!GA4_ID) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA4_ID);

  window.track = function (name, params) { gtag('event', name, params || {}); };

  // ページ内のどこにある要素か（ヘッダー／ヒーロー／各セクション／SP固定バー／浮遊ボタン）
  function where(el) {
    if (el.closest('.header')) return 'header';
    if (el.closest('.sp-fixed')) return 'sp_fixed';
    if (el.closest('.float-search')) return 'float';
    var sec = el.closest('section');
    return sec ? (sec.id || sec.className.split(' ')[0]) : 'other';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a, button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) {
      track('click_tel', { location: where(a) });
    } else if (href === '#vehicles' || href === '#contact') {
      track('cta_click', { target: href.slice(1), location: where(a), label: a.textContent.trim().slice(0, 30) });
    } else if (a.matches('.v-ask, .v-pick')) {
      track('select_vehicle', { vehicle_type: a.dataset.type || '', from: a.matches('.v-pick') ? 'search_result' : 'lineup' });
    }
  }, true);
})();
