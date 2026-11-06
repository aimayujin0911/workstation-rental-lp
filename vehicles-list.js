// 車両一覧（ラインナップ）＋ 空き車両検索。データは vehicles.js（出典：ロジレント）
(function () {
  var LINEUP = window.LINEUP || [];
  var grid = document.getElementById('v-grid');
  if (!grid) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(v) {
    if (typeof v === 'number') return v;
    return parseInt(String(v || '').replace(/[¥￥,，〜～\s]/g, ''), 10) || 0;
  }
  function yen(v) { var n = num(v); return n ? '¥' + n.toLocaleString('ja-JP') : '要相談'; }
  // 「4t冷凍トラック」「4t冷凍車」のような表記ゆれを吸収して車種を特定
  function norm(t) { return String(t || '').replace(/[ 　]/g, '').replace(/トラック|車$/g, '').replace('トレーラー', 'トレーラ'); }
  function lineupOf(type) {
    var n = norm(type);
    return LINEUP.filter(function (l) { return norm(l.type) === n; })[0];
  }

  // 側面イラスト
  function truckSVG(body) {
    var cab = '<path d="M164 30h32c4 0 7 2 9 5l18 26c1 2 2 4 2 6v15h-61z" class="t-cab"/>' +
              '<path d="M174 37h20l13 20h-33z" class="t-win"/><rect x="164" y="64" width="61" height="5" class="t-stripe"/>';
    var wheels = function (xs) {
      return xs.map(function (x) { return '<circle cx="' + x + '" cy="92" r="13" class="t-tire"/><circle cx="' + x + '" cy="92" r="5" class="t-hub"/>'; }).join('');
    };
    var chassis = function (x, w) { return '<rect x="' + x + '" y="82" width="' + w + '" height="8" rx="2" class="t-chassis"/>'; };
    var parts = {
      small:   '<rect x="60" y="38" width="100" height="44" rx="3" class="t-body"/>' + cab + chassis(58, 169) + wheels([92, 200]),
      box:     '<rect x="30" y="26" width="130" height="56" rx="3" class="t-body"/>' + cab + chassis(28, 199) + wheels([64, 200]),
      wing:    '<rect x="10" y="20" width="150" height="62" rx="3" class="t-body"/><path d="M10 40h150" class="t-line"/><path d="M14 24l20-8h120l6 8" class="t-line"/>' + cab + chassis(8, 219) + wheels([48, 78, 200]),
      cold:    '<rect x="10" y="20" width="150" height="62" rx="3" class="t-body"/><rect x="140" y="9" width="20" height="13" rx="2" class="t-unit"/><path d="M144 13h12M144 17h12" class="t-line"/>' + cab + chassis(8, 219) + wheels([48, 78, 200]),
      large:   '<rect x="4" y="12" width="156" height="70" rx="3" class="t-body"/><path d="M4 34h156" class="t-line"/>' + cab + chassis(2, 225) + wheels([30, 58, 172, 200]),
      trailer: '<rect x="2" y="18" width="150" height="62" rx="3" class="t-body"/><path d="M2 38h150" class="t-line"/><rect x="2" y="80" width="150" height="6" class="t-chassis"/>' +
               '<path d="M176 34h22c4 0 7 2 9 5l14 22c1 2 2 4 2 6v15h-47z" class="t-cab"/><path d="M182 40h14l11 17h-25z" class="t-win"/><rect x="176" y="64" width="47" height="5" class="t-stripe"/>' +
               chassis(140, 87) + wheels([24, 52, 80, 166, 200])
    };
    return '<svg viewBox="0 0 240 112" class="truck-svg" aria-hidden="true">' + (parts[body] || parts.box) + '</svg>';
  }

  function priceRow(day, month, lease) {
    return '<div class="v-prices">' +
      '<div><dt>日額</dt><dd>' + yen(day) + '</dd></div>' +
      '<div class="is-main"><dt>月額</dt><dd>' + yen(month) + '</dd></div>' +
      '<div class="is-lease"><dt>長期契約（月）</dt><dd>' + yen(lease) + '</dd></div>' +
    '</div>';
  }

  // ===== ラインナップ =====
  grid.innerHTML = LINEUP.map(function (l, i) {
    return '<article class="v-card' + (l.popular ? ' is-popular' : '') + '" style="--i:' + i + '">' +
      '<div class="v-media cat-' + esc(l.body) + '">' + truckSVG(l.body) +
        '<span class="v-tagline">' + esc(l.tag) + '</span>' +
        '<span class="v-id">MAX ' + esc(l.payload) + '</span>' +
      '</div>' +
      '<div class="v-body">' +
        '<h3>' + esc(l.type) + '</h3>' +
        '<p class="v-maker">' + esc(l.makers) + '</p>' +
        '<p class="v-use">' + esc(l.use) + '</p>' +
        '<div class="v-foot">' +
          priceRow(l.priceDay, l.priceMonth, l.priceLease) +
          '<div class="v-actions">' +
            '<button type="button" class="btn btn-outline v-check" data-type="' + esc(l.type) + '">空きを検索</button>' +
            '<button type="button" class="btn btn-navy v-ask" data-type="' + esc(l.type) + '">問い合わせる <span class="arrow">→</span></button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }).join('');

  // ===== 検索フォーム =====
  var form = document.getElementById('v-search');
  var fStart = document.getElementById('vs-start');
  var fEnd = document.getElementById('vs-end');
  var fType = document.getElementById('vs-type');
  var fLoc = document.getElementById('vs-loc');
  var btn = document.getElementById('vs-btn');
  var result = document.getElementById('v-result');
  var rTitle = document.getElementById('v-result-title');
  var rGrid = document.getElementById('v-result-grid');
  var rEmpty = document.getElementById('v-empty');
  var rLoading = document.getElementById('v-loading');
  var found = [];

  LINEUP.forEach(function (l) { fType.insertAdjacentHTML('beforeend', '<option>' + esc(l.type) + '</option>'); });
  (window.LOCATIONS || []).forEach(function (l) { fLoc.insertAdjacentHTML('beforeend', '<option>' + esc(l) + '</option>'); });

  function ymd(d) { var z = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  var today = new Date();
  fStart.value = ymd(today);
  fStart.min = ymd(today);
  fEnd.value = ymd(new Date(today.getTime() + 86400000));
  fStart.addEventListener('change', function () {
    fEnd.min = fStart.value;
    if (fEnd.value < fStart.value) fEnd.value = fStart.value;
  });

  function days() { return Math.max(1, Math.round((new Date(fEnd.value) - new Date(fStart.value)) / 86400000)); }

  function renderFound() {
    rGrid.innerHTML = found.map(function (v, i) {
      var l = lineupOf(v.type) || {};
      return '<article class="v-card is-live" style="--i:' + i + '">' +
        '<div class="v-media cat-' + esc(l.body || 'box') + '">' + truckSVG(l.body) +
          '<span class="v-status st-ok">空き</span>' +
          (v.id ? '<span class="v-id">No.' + esc(v.id) + '</span>' : '') +
        '</div>' +
        '<div class="v-body">' +
          '<h3>' + esc(v.type) + '</h3>' +
          '<p class="v-maker">' + esc(v.maker) + (v.modelCode ? '<span>' + esc(v.modelCode) + '</span>' : '') + '</p>' +
          '<dl class="v-spec">' +
            '<div><dt>最大積載</dt><dd>' + esc(v.payload || v.capacity || '-') + '</dd></div>' +
            '<div><dt>必要免許</dt><dd>' + esc(v.license || '-') + '</dd></div>' +
            '<div><dt>営業所</dt><dd>' + esc(String(v.location || '-').replace('営業所', '')) + '</dd></div>' +
          '</dl>' +
          (v.note ? '<p class="v-use">' + esc(v.note) + '</p>' : '') +
          '<div class="v-foot">' +
            priceRow(v.priceDay, v.priceMonth, v.priceLease) +
            '<button type="button" class="btn btn-navy v-pick" data-i="' + i + '" data-type="' + esc(v.type) + '">この車両で問い合わせる <span class="arrow">→</span></button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function search() {
    if (!fStart.value || !fEnd.value) return;
    result.hidden = false;
    rGrid.innerHTML = '';
    rEmpty.hidden = true;
    rLoading.hidden = false;
    btn.disabled = true;
    var range = fStart.value.replace(/-/g, '/') + ' 〜 ' + fEnd.value.replace(/-/g, '/') + '（' + days() + '日間）';
    rTitle.textContent = range + 'の空き車両';
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });

    var q = new URLSearchParams({ startDate: fStart.value, endDate: fEnd.value, vehicleType: fType.value, location: fLoc.value });
    fetch(window.VACANCY_API + '?' + q)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) {
        if (j.status !== 'ok') throw new Error(j.message || 'error');
        found = j.data || [];
        window.track && window.track('vehicle_search', { vehicle_type: fType.value, location: fLoc.value, days: days(), results: found.length });
        if (found.length) { rTitle.innerHTML = esc(range) + 'の空き車両 <b>' + found.length + '台</b>'; renderFound(); return; }
        quickBox(range, false);
      })
      .catch(function () { quickBox(range, true); })
      .then(function () { rLoading.hidden = true; btn.disabled = false; });
  }

  // 該当0台・取得失敗のとき：行き止まりにせず、その場で手配確認を依頼できるようにする
  function condText() {
    var t = (!fType.value || fType.value === 'すべて') ? '車種未定' : fType.value;
    return [t, fLoc.value === 'すべて' ? '' : fLoc.value, fStart.value + '〜' + fEnd.value].filter(Boolean).join(' ');
  }
  function quickBox(range, failed) {
    rTitle.innerHTML = esc(range) + 'の手配確認';
    rEmpty.innerHTML =
      '<div class="vq">' +
        '<p class="vq-lead"><strong>' + (failed ? 'この条件の空き状況を、担当者が直接お調べします。' : 'この条件の車両、担当者がお探しします。') + '</strong>' +
        '掲載中の車両以外にも、他営業所・提携先からの手配で対応できることがあります。電話番号だけで依頼できます。</p>' +
        '<p class="vq-cond">ご依頼内容：' + esc(condText()) + '（' + days() + '日間）</p>' +
        '<form class="vq-form" id="vq-form">' +
          '<label>電話番号 <span class="req">必須</span><input type="tel" id="vq-tel" required inputmode="tel" autocomplete="tel" placeholder="例）042-850-7077"></label>' +
          '<label>会社名 <span class="opt">任意</span><input type="text" id="vq-company" autocomplete="organization" placeholder="例）株式会社○○運送"></label>' +
          '<button type="submit" class="btn btn-lime btn-shine">この条件で手配を依頼する <span class="arrow">→</span></button>' +
        '</form>' +
        '<p class="vq-or">お急ぎの方は <a href="tel:0428507077">☎ 042-850-7077</a>（平日 9:00〜18:00）／<button type="button" class="vq-full v-ask-cond">詳しく書いて問い合わせる</button></p>' +
        '<div class="vq-done" hidden><b>✓ 依頼を受け付けました</b>担当者が空き状況を確認し、折り返しお電話します。</div>' +
      '</div>';
    rEmpty.hidden = false;
  }
  rEmpty.addEventListener('submit', function (e) {
    if (e.target.id !== 'vq-form') return;
    e.preventDefault();
    var t = fType.value === 'すべて' ? '' : fType.value;
    var l = lineupOf(t);
    var btn2 = e.target.querySelector('button'); btn2.disabled = true;
    window.sendLead({
      tel: document.getElementById('vq-tel').value.trim(),
      company: document.getElementById('vq-company').value.trim(),
      vehicles: (l && l.form) || t || '未定',
      detail: condText(),
      start: fStart.value,
      period: days() + '日間（' + fStart.value + '〜' + fEnd.value + '）'
    }, 'search_quick').then(function () {
      e.target.hidden = true;
      rEmpty.querySelector('.vq-or').hidden = true;
      rEmpty.querySelector('.vq-done').hidden = false;
    });
  });

  form.addEventListener('submit', function (e) { e.preventDefault(); search(); });
  document.getElementById('v-result-close').addEventListener('click', function () { result.hidden = true; });

  // ===== フォーム連携 =====
  function toForm(type, detail, withDates) {
    var l = lineupOf(type);
    if (l) document.querySelectorAll('input[name="vehicle"]').forEach(function (cb) { if (cb.value === l.form) cb.checked = true; });
    if (detail) {
      var f = document.getElementById('f-vehicle-id');
      f.value = f.value ? f.value + '／' + detail : detail;
    }
    if (withDates) {
      var s = document.getElementById('f-start');
      if (s) s.value = fStart.value;
      var p = document.getElementById('f-period');
      if (p) {
        var d = days();
        p.value = d < 7 ? '1週間未満' : d < 28 ? '1か月未満' : d < 45 ? '1か月' : d <= 92 ? '2〜3か月' : d <= 183 ? '4〜6か月' : '6か月以上';
      }
    }
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  }

  grid.addEventListener('click', function (e) {
    var c = e.target.closest('.v-check');
    if (c) { fType.value = c.dataset.type; search(); return; }
    var a = e.target.closest('.v-ask');
    if (a) toForm(a.dataset.type, a.dataset.type, false);
  });
  rGrid.addEventListener('click', function (e) {
    var b = e.target.closest('.v-pick');
    if (!b) return;
    var v = found[+b.dataset.i];
    toForm(v.type, [v.id && 'No.' + v.id, v.type, v.maker, v.location, fStart.value + '〜' + fEnd.value].filter(Boolean).join(' '), true);
  });
  rEmpty.addEventListener('click', function (e) {
    if (!e.target.closest('.v-ask-cond')) return;
    var t = fType.value === 'すべて' ? '' : fType.value;
    toForm(t, condText(), true);
  });
})();
