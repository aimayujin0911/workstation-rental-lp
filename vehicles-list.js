// 車両一覧の描画（データは vehicles.js）
(function () {
  var data = window.VEHICLES || [];
  var CATS = [
    { key: 'all',  label: 'すべて' },
    { key: '2t',   label: '2t（S/L）',     form: '2t（S/L）' },
    { key: '2tc',  label: '2t冷蔵・冷凍',  form: '2t冷蔵・冷凍' },
    { key: '4t',   label: '4t',            form: '4t' },
    { key: '4tc',  label: '4t冷蔵・冷凍',  form: '4t冷蔵・冷凍' },
    { key: 'dump', label: 'ダンプ',        form: 'ダンプ' },
    { key: '10t',  label: '10t',           form: '10t' }
  ];
  var STATUS = {
    available: { label: '空車',     cls: 'st-ok' },
    soon:      { label: '近日空き', cls: 'st-soon' },
    rented:    { label: '貸出中',   cls: 'st-out' }
  };
  var state = { cat: 'all', onlyAvailable: false };

  var tabs = document.getElementById('v-tabs');
  var grid = document.getElementById('v-grid');
  var empty = document.getElementById('v-empty');
  var toggle = document.getElementById('v-available');
  if (!tabs || !grid) return;
  if (window.SAMPLE_MODE) document.getElementById('sample-note').hidden = false;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function yen(n) { return n.toLocaleString('ja-JP'); }
  // 千円単位で割り切れる金額は「○万円」（7.5万円など）、それ以外は円表記
  function priceHTML(n) {
    return n % 1000 === 0
      ? '<b>' + yen(n / 10000) + '</b><span>万円/月〜</span>'
      : '<b>' + yen(n) + '</b><span>円/月〜</span>';
  }

  // 側面イラスト（写真が無い車両用）
  function truckSVG(body) {
    var cargo = {
      box:  '<rect x="10" y="20" width="150" height="62" rx="3" class="t-body"/>',
      wing: '<rect x="10" y="20" width="150" height="62" rx="3" class="t-body"/><path d="M10 40h150" class="t-line"/><path d="M14 24l20-8h120l6 8" class="t-line"/>',
      cold: '<rect x="10" y="20" width="150" height="62" rx="3" class="t-body"/><rect x="140" y="9" width="20" height="13" rx="2" class="t-unit"/><path d="M144 13h12M144 17h12" class="t-line"/>',
      flat: '<rect x="10" y="66" width="150" height="16" rx="2" class="t-body"/><path d="M10 66v-8h4v8M156 66v-8h4v8" class="t-line"/>',
      dump: '<path d="M14 40h146l-8 42H24z" class="t-body"/><path d="M14 40l-4-6h10" class="t-line"/>'
    }[body] || '';
    return '<svg viewBox="0 0 240 112" class="truck-svg" aria-hidden="true">' +
      cargo +
      '<path d="M164 30h32c4 0 7 2 9 5l18 26c1 2 2 4 2 6v15h-61z" class="t-cab"/>' +
      '<path d="M174 37h20l13 20h-33z" class="t-win"/>' +
      '<rect x="164" y="64" width="61" height="5" class="t-stripe"/>' +
      '<rect x="8" y="82" width="219" height="8" rx="2" class="t-chassis"/>' +
      [48, 78, 200].map(function (x) {
        return '<circle cx="' + x + '" cy="92" r="13" class="t-tire"/><circle cx="' + x + '" cy="92" r="5" class="t-hub"/>';
      }).join('') +
      '</svg>';
  }

  function renderTabs() {
    tabs.innerHTML = CATS.map(function (c) {
      var n = c.key === 'all' ? data.length : data.filter(function (v) { return v.category === c.key; }).length;
      return '<button type="button" role="tab" class="v-tab' + (state.cat === c.key ? ' is-active' : '') +
        '" aria-selected="' + (state.cat === c.key) + '" data-cat="' + c.key + '">' +
        esc(c.label) + '<small>' + n + '</small></button>';
    }).join('');
  }

  function renderGrid() {
    var list = data.filter(function (v) {
      return (state.cat === 'all' || v.category === state.cat) &&
             (!state.onlyAvailable || v.status === 'available');
    });
    empty.hidden = list.length > 0;
    grid.innerHTML = list.map(function (v, i) {
      var st = STATUS[v.status] || STATUS.available;
      var media = v.image
        ? '<img src="' + esc(v.image) + '" alt="' + esc(v.name) + '" loading="lazy">'
        : truckSVG(v.body);
      var btn = v.status === 'rented' ? '空き予定を問い合わせる' : 'この車両で問い合わせる';
      return '<article class="v-card ' + (v.status === 'rented' ? 'is-out' : '') + '" style="--i:' + i + '">' +
        '<div class="v-media cat-' + esc(v.category) + '">' + media +
          '<span class="v-status ' + st.cls + '">' + st.label + '</span>' +
          '<span class="v-id">No.' + esc(v.id) + '</span>' +
        '</div>' +
        '<div class="v-body">' +
          '<h3>' + esc(v.name) + '</h3>' +
          '<p class="v-maker">' + esc(v.maker) + '<span>' + esc(v.year) + '年式</span></p>' +
          '<dl class="v-spec">' +
            '<div><dt>最大積載</dt><dd>' + esc(v.payload) + '</dd></div>' +
            '<div><dt>必要免許</dt><dd>' + esc(v.license) + '</dd></div>' +
            '<div><dt>営業所</dt><dd>' + esc(v.location) + '</dd></div>' +
          '</dl>' +
          '<ul class="v-feat">' + (v.features || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
          '<div class="v-foot">' +
            '<p class="v-price">' + priceHTML(v.price) + '</p>' +
            '<button type="button" class="btn btn-navy v-ask" data-id="' + esc(v.id) + '">' + btn + ' <span class="arrow">→</span></button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.v-tab');
    if (!b) return;
    state.cat = b.dataset.cat;
    renderTabs(); renderGrid();
  });
  toggle.addEventListener('change', function () { state.onlyAvailable = toggle.checked; renderGrid(); });

  // 車両 → フォームへ（車格チェック＋車両No.入力）
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.v-ask');
    if (!b) return;
    var v = data.filter(function (x) { return x.id === b.dataset.id; })[0];
    if (!v) return;
    var cat = CATS.filter(function (c) { return c.key === v.category; })[0];
    document.querySelectorAll('input[name="vehicle"]').forEach(function (cb) {
      if (cat && cb.value === cat.form) cb.checked = true;
    });
    var idField = document.getElementById('f-vehicle-id');
    var ids = idField.value ? idField.value.split(/[、,\s]+/) : [];
    if (ids.indexOf(v.id) < 0) ids.push(v.id);
    idField.value = ids.join('、');
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  });

  // ファーストビューの料金カードから来たら、その車格で絞り込む
  document.querySelectorAll('.price-strip a').forEach(function (a) {
    var map = { 'price-2t': '2t', 'price-2tc': '2tc', 'price-4t': '4t', 'price-4tc': '4tc', 'price-dump': 'dump', 'price-10t': '10t' };
    var key = map[a.getAttribute('href').slice(1)];
    if (!key) return;
    a.setAttribute('href', '#vehicles');
    a.addEventListener('click', function () { state.cat = key; renderTabs(); renderGrid(); });
  });

  renderTabs(); renderGrid();
})();
