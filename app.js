(() => {
  const state = {
    loggedIn: false,
    profileEditing: false,
    pendingProfileChanges: null,
    noticeTab: 'school',
    accountTab: 'general',
    otpTimer: null,
    otpSeconds: 30,
    email: 'an.nguyen@example.com',
    pendingEmail: null,
    sites: [
      {
        id: 'bav-hn', name: 'Học viện Ngân hàng', city: 'Hà Nội', address: '12 Chùa Bộc, Đống Đa, Hà Nội', open: true,
        rounds: [
          { id: 'r1', name: 'Đợt 1', date: '15/03/2027', capacity: 1000, available: 800, status: 'unpaid', reservedHours: 38, subjects: ['Toán','Ngữ văn','Tiếng Anh'], schoolRules: { changeSubject: true, changeRound: true, addSubject: true } },
          { id: 'r2', name: 'Đợt 2', date: '20/04/2027', capacity: 900, available: 612, status: 'paid', subjects: ['Toán','Ngữ văn','Tiếng Anh','Vật lý'], schoolRules: { changeSubject: true, changeRound: true, addSubject: true } },
          { id: 'r3', name: 'Đợt 3', date: '18/05/2027', capacity: 800, available: 735, status: 'none', subjects: [], schoolRules: { changeSubject: false, changeRound: true, addSubject: true } },
        ]
      },
      {
        id: 'hp', name: 'Điểm thi Hải Phòng', city: 'Hải Phòng', address: 'Quận Lê Chân, Hải Phòng', open: false,
        rounds: [
          { id: 'r4', name: 'Đợt 1', date: '22/03/2027', capacity: 500, available: 420, status: 'none', subjects: [], schoolRules: { changeSubject: true, changeRound: true, addSubject: true } }
        ]
      }
    ],
    allSubjects: ['Toán','Ngữ văn','Tiếng Anh','Vật lý','Hóa học','Sinh học','Lịch sử','Địa lý'],
    invoices: [
      { id: 'INV-2027-00128', action: 'Đăng ký Đợt 1', context: 'Học viện Ngân hàng · Đợt 1', amount: 600000, beneficiary: 'Học viện Ngân hàng', status: 'unpaid', reservationHours: 38, roundId: 'r1', apply: 'registration' },
      { id: 'INV-2027-00102', action: 'Đăng ký thêm môn Vật lý', context: 'Học viện Ngân hàng · Đợt 2', amount: 200000, beneficiary: 'Học viện Ngân hàng', status: 'paid', paidAt: '10/09/2026 10:25', apply: 'addSubject' },
      { id: 'INV-2027-00091', action: 'Đổi môn thi', context: 'Đợt 2', amount: 50000, beneficiary: 'Công ty KH', status: 'paid', paidAt: '02/09/2026 15:10', apply: 'changeSubject' }
    ],
    notifications: {
      school: [
        { id: 1, title: 'Cập nhật lịch thi Đợt 2', excerpt: 'SBD, phòng thi và ca thi đã được cập nhật.', date: '11/09/2026 09:15', unread: true, body: 'Đơn vị tổ chức đã cập nhật SBD, phòng thi và ca thi cho Đợt 2. Thí sinh vui lòng kiểm tra tại mục Kết quả thi và tải lại Phiếu xác nhận nếu cần.' },
        { id: 2, title: 'Hướng dẫn có mặt tại điểm thi', excerpt: 'Thí sinh có mặt trước giờ thi tối thiểu 30 phút.', date: '10/09/2026 16:20', unread: true, body: 'Thí sinh vui lòng có mặt tại điểm thi trước giờ thi tối thiểu 30 phút, mang theo CCCD bản gốc và tuân thủ hướng dẫn của cán bộ coi thi.' },
        { id: 3, title: 'Thông báo mở đăng ký Đợt 3', excerpt: 'Đợt 3 bắt đầu nhận đăng ký.', date: '08/09/2026 08:00', unread: false, body: 'Đợt 3 đã mở đăng ký. Thí sinh đã hoàn thiện hồ sơ có thể lựa chọn đợt thi trên hệ thống.' }
      ],
      system: [
        { id: 11, title: 'Thanh toán thành công', excerpt: 'Hóa đơn INV-2027-00102 đã được thanh toán.', date: '10/09/2026 10:25', unread: true, body: 'Hệ thống đã ghi nhận thanh toán thành công và tự động áp dụng hành động Đăng ký thêm môn Vật lý.' },
        { id: 12, title: 'Nhắc thanh toán', excerpt: 'Đăng ký Đợt 1 còn dưới 48 giờ giữ chỗ.', date: '10/09/2026 07:40', unread: false, body: 'Đăng ký Đợt 1 của bạn đang chờ thanh toán. Hệ thống sẽ tự động hủy giữ chỗ khi hết 96 giờ.' }
      ]
    }
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmtMoney = n => new Intl.NumberFormat('vi-VN').format(n) + ' VNĐ';

  function toast(message, type = '') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    $('#toastRegion').appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function openModal(id) {
    $$('.modal').forEach(m => m.classList.remove('open'));
    const modal = $('#' + id);
    if (!modal) return;
    $('#modalBackdrop').classList.add('open');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModals() {
    $$('.modal').forEach(m => { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); });
    $('#modalBackdrop').classList.remove('open');
    document.body.style.overflow = '';
  }

  function showPublic(view) {
    if (state.loggedIn) return;
    $$('.public-view').forEach(v => v.classList.toggle('active', v.dataset.view === view));
    $$('[data-public-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.publicView === view && btn.classList.contains('nav-link')));
    $('#publicNav').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function login() {
    state.loggedIn = true;
    $('#publicHeader').classList.add('hidden');
    $('#publicApp').classList.add('hidden');
    $('#studentApp').classList.remove('hidden');
    showStudent('profile');
    renderAllPortal();
    closeModals();
    toast('Đăng nhập thành công', 'success');
  }

  function logout() {
    state.loggedIn = false;
    $('#studentApp').classList.add('hidden');
    $('#publicHeader').classList.remove('hidden');
    $('#publicApp').classList.remove('hidden');
    showPublic('home');
    toast('Đã đăng xuất');
  }

  const titles = { profile: 'Thông tin thí sinh', registration: 'Đăng ký thi', payment: 'Thanh toán', results: 'Kết quả thi', notifications: 'Thông báo', account: 'Tài khoản' };
  function showStudent(view) {
    $$('.student-view').forEach(s => s.classList.toggle('active', s.dataset.studentSection === view));
    $$('.student-nav-item').forEach(b => b.classList.toggle('active', b.dataset.studentView === view));
    $('#studentPageTitle').textContent = titles[view] || '';
    $('#studentSidebar').classList.remove('open');
    if (view === 'payment') renderInvoices();
    if (view === 'registration') renderRegistrations();
    if (view === 'notifications') renderNotifications();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function findRound(id) {
    for (const site of state.sites) {
      const round = site.rounds.find(r => r.id === id);
      if (round) return { site, round };
    }
    return null;
  }

  function statusLabel(round) {
    if (round.status === 'unpaid') return '<span class="state-label state-unpaid">⏳ Đã đăng ký · Chưa thanh toán</span>';
    if (round.status === 'paid') return '<span class="state-label state-paid">✓ Đã thanh toán</span>';
    return '<span class="state-label state-empty">Chưa đăng ký</span>';
  }

  function subjectMarkup(round) {
    return state.allSubjects.map(s => {
      const checked = round.subjects.includes(s);
      const disabled = round.status !== 'none';
      return `<label class="subject-check"><input type="checkbox" data-subject="${s}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span>${s}</span></label>`;
    }).join('');
  }

  function renderRegistrations() {
    const host = $('#registrationSites');
    host.innerHTML = state.sites.map(site => `
      <article class="site-card ${site.open ? 'open' : ''}" data-site-id="${site.id}">
        <button class="site-toggle" data-toggle-site="${site.id}"><div><strong>${site.name}</strong><small>${site.address}</small></div><span>${site.open ? '⌃' : '⌄'}</span></button>
        <div class="site-body">
          ${site.rounds.map((round, i) => `
            <div class="round-item ${i === 0 && site.open ? 'open' : ''}" data-round-id="${round.id}">
              <button class="round-toggle" data-toggle-round="${round.id}">
                <div class="round-title"><strong>${round.name}</strong><small>Ngày thi: ${round.date}</small></div>
                <div class="round-meta">${statusLabel(round)}<span>⌄</span></div>
              </button>
              <div class="round-body">
                <div class="round-info-strip"><div><small>Ngày thi</small><strong>${round.date}</strong></div><div><small>Sức chứa</small><strong>${round.capacity.toLocaleString('vi-VN')}</strong></div><div><small>Còn trống</small><strong>${round.available.toLocaleString('vi-VN')}</strong></div><div><small>Trạng thái</small><strong>${round.available > 0 ? 'Còn chỗ' : 'Hết chỗ'}</strong></div></div>
                <strong>Môn thi</strong>
                <div class="subject-selector">${subjectMarkup(round)}</div>
                <div class="round-actions">
                  <button class="btn btn-primary btn-sm" data-action="register" data-round="${round.id}" ${round.status !== 'none' ? 'disabled' : ''}>Đăng ký</button>
                  <button class="btn btn-light btn-sm" data-action="cancel" data-round="${round.id}" ${round.status !== 'unpaid' ? 'disabled' : ''}>Hủy đăng ký</button>
                  <button class="btn btn-light btn-sm" data-action="changeSubject" data-round="${round.id}" ${round.status !== 'paid' || !round.schoolRules.changeSubject ? 'disabled' : ''}>Đổi môn thi</button>
                  <button class="btn btn-light btn-sm" data-action="changeRound" data-round="${round.id}" ${round.status !== 'paid' || !round.schoolRules.changeRound ? 'disabled' : ''}>Đổi đợt thi</button>
                  <button class="btn btn-light btn-sm" data-action="addSubject" data-round="${round.id}" ${round.status !== 'paid' || !round.schoolRules.addSubject ? 'disabled' : ''}>Đăng ký thêm môn</button>
                  ${round.status === 'unpaid' ? `<button class="btn btn-primary btn-sm" data-action="payRound" data-round="${round.id}">Thanh toán</button><span class="countdown">Giữ chỗ còn ~${round.reservedHours} giờ</span>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </article>`).join('');
  }

  function renderInvoices() {
    const rank = { unpaid: 0, processing: 1, paid: 2 };
    const invoices = [...state.invoices].sort((a,b) => rank[a.status] - rank[b.status]);
    $('#invoiceList').innerHTML = invoices.map(inv => `
      <article class="invoice-row">
        <div class="invoice-main"><strong>${inv.action}</strong><small>${inv.id} · ${inv.context}</small></div>
        <div class="invoice-meta"><small>Số tiền</small><span class="money">${fmtMoney(inv.amount)}</span></div>
        <div class="invoice-meta"><small>Người thụ hưởng</small><strong>${inv.beneficiary}</strong></div>
        <div>
          ${inv.status === 'unpaid' ? `<span class="state-label state-unpaid invoice-status">Chưa thanh toán</span><div style="height:8px"></div><button class="btn btn-primary btn-sm" data-pay-invoice="${inv.id}">Thanh toán</button>${inv.reservationHours ? `<div class="countdown" style="margin-top:6px">Còn ~${inv.reservationHours} giờ</div>` : ''}` : `<span class="state-label state-paid invoice-status">✓ Đã thanh toán</span><div style="height:5px"></div><small>${inv.paidAt || ''}</small>`}
        </div>
      </article>`).join('');
    const unpaid = state.invoices.filter(i => i.status === 'unpaid').length;
    $('#unpaidBadge').textContent = unpaid;
    $('#unpaidBadge').classList.toggle('hidden', unpaid === 0);
  }

  function renderNotifications() {
    const list = state.notifications[state.noticeTab];
    $('#notificationList').innerHTML = list.map(n => `<button class="notification-item ${n.unread ? 'unread' : ''}" data-notice-id="${n.id}" data-notice-source="${state.noticeTab}"><span class="notification-dot"></span><span class="notification-copy"><strong>${n.title}</strong><small>${n.excerpt}</small></span><span class="notification-time">${n.date}</span></button>`).join('');
    updateNoticeBadge();
  }

  function updateNoticeBadge() {
    const count = Object.values(state.notifications).flat().filter(n => n.unread).length;
    $('#noticeBadge').textContent = count;
    $('#noticeBadge').classList.toggle('hidden', count === 0);
    $$('.dot-badge').forEach(b => { b.textContent = count; b.classList.toggle('hidden', count === 0); });
  }

  function renderAllPortal() { renderRegistrations(); renderInvoices(); renderNotifications(); updateNoticeBadge(); }

  function openAction(action, roundId) {
    const found = findRound(roundId);
    if (!found) return;
    const { site, round } = found;
    const content = $('#actionModalContent');

    if (action === 'register') {
      const item = $(`[data-round-id="${roundId}"]`);
      const subjects = $$('input[data-subject]:checked', item).map(x => x.dataset.subject);
      if (subjects.length < 3) { toast('Vui lòng chọn tối thiểu 3 môn', 'warning'); return; }
      content.innerHTML = `<div class="modal-head"><span class="eyebrow">XÁC NHẬN</span><h2>Đăng ký ${round.name}</h2><p>${site.name}</p></div><div class="action-summary"><div><span>Ngày thi</span><strong>${round.date}</strong></div><div><span>Môn đăng ký</span><strong>${subjects.join(', ')}</strong></div><div><span>Lệ phí dự kiến</span><strong>${fmtMoney(subjects.length * 200000)}</strong></div><div><span>Giữ chỗ</span><strong>96 giờ</strong></div></div><div class="modal-actions"><button class="btn btn-light" data-close-modal>Hủy</button><button class="btn btn-primary" id="confirmRegisterBtn">Xác nhận đăng ký</button></div>`;
      openModal('actionModal');
      $('#confirmRegisterBtn').onclick = () => {
        round.status = 'unpaid'; round.subjects = subjects; round.reservedHours = 96; round.available = Math.max(0, round.available - 1);
        state.invoices.unshift({ id: 'INV-' + Date.now().toString().slice(-8), action: `Đăng ký ${round.name}`, context: `${site.name} · ${round.name}`, amount: subjects.length * 200000, beneficiary: site.name, status: 'unpaid', reservationHours: 96, roundId, apply: 'registration' });
        closeModals(); renderAllPortal(); toast('Đăng ký thành công. Chỗ được giữ trong 96 giờ.', 'success');
      };
      return;
    }

    if (action === 'cancel') {
      content.innerHTML = `<div class="modal-head"><span class="eyebrow">HỦY ĐĂNG KÝ</span><h2>Hủy ${round.name}?</h2><p>Chỗ giữ sẽ được trả lại ngay và hóa đơn liên quan không còn hiệu lực.</p></div><div class="modal-actions"><button class="btn btn-light" data-close-modal>Không hủy</button><button class="btn btn-danger" id="confirmCancelBtn">Xác nhận hủy</button></div>`;
      openModal('actionModal');
      $('#confirmCancelBtn').onclick = () => {
        round.status = 'none'; round.subjects = []; round.available += 1; delete round.reservedHours;
        state.invoices = state.invoices.filter(i => !(i.roundId === roundId && i.status === 'unpaid' && i.apply === 'registration'));
        closeModals(); renderAllPortal(); toast('Đã hủy đăng ký và trả lại chỗ', 'success');
      };
      return;
    }

    if (action === 'payRound') {
      const inv = state.invoices.find(i => i.roundId === roundId && i.status === 'unpaid' && i.apply === 'registration');
      if (inv) openPayment(inv.id);
      else toast('Không tìm thấy hóa đơn cần thanh toán', 'warning');
      return;
    }

    if (action === 'addSubject') {
      const available = state.allSubjects.filter(s => !round.subjects.includes(s));
      content.innerHTML = `<div class="modal-head"><span class="eyebrow">ĐĂNG KÝ THÊM</span><h2>Thêm môn vào ${round.name}</h2><p>Khoản phí này được thanh toán cho đơn vị tổ chức thi.</p></div><div class="subject-selector">${available.map((s,i)=>`<label class="subject-check"><input type="radio" name="newSubject" value="${s}" ${i===0?'checked':''}><span>${s}</span></label>`).join('')}</div><div class="action-summary"><div><span>Lệ phí</span><strong>200.000 VNĐ</strong></div><div><span>Người thụ hưởng</span><strong>${site.name}</strong></div></div><div class="modal-actions"><button class="btn btn-light" data-close-modal>Hủy</button><button class="btn btn-primary" id="confirmAddSubjectBtn">Tạo hóa đơn</button></div>`;
      openModal('actionModal');
      $('#confirmAddSubjectBtn').onclick = () => {
        const subject = $('input[name="newSubject"]:checked', content)?.value;
        if (!subject) return;
        state.invoices.unshift({ id:'INV-'+Date.now().toString().slice(-8), action:`Đăng ký thêm môn ${subject}`, context:`${site.name} · ${round.name}`, amount:200000, beneficiary:site.name, status:'unpaid', apply:'addSubject', roundId, payload:{subject} });
        closeModals(); renderInvoices(); toast('Đã tạo hóa đơn thêm môn'); showStudent('payment');
      };
      return;
    }

    if (action === 'changeSubject') {
      content.innerHTML = `<div class="modal-head"><span class="eyebrow">ĐỔI MÔN</span><h2>Đổi môn thi</h2><p>Đổi môn sau thanh toán áp dụng phí dịch vụ về KH.</p></div><div class="form-grid cols-2"><label>Môn hiện tại<select id="oldSubjectSelect">${round.subjects.map(s=>`<option>${s}</option>`).join('')}</select></label><label>Môn thay thế<select id="newSubjectSelect">${state.allSubjects.filter(s=>!round.subjects.includes(s)).map(s=>`<option>${s}</option>`).join('')}</select></label></div><div class="action-summary"><div><span>Phí đổi môn</span><strong>50.000 VNĐ</strong></div><div><span>Người thụ hưởng</span><strong>Công ty KH</strong></div></div><div class="modal-actions"><button class="btn btn-light" data-close-modal>Hủy</button><button class="btn btn-primary" id="confirmChangeSubjectBtn">Tạo hóa đơn</button></div>`;
      openModal('actionModal');
      $('#confirmChangeSubjectBtn').onclick = () => {
        const oldSubject = $('#oldSubjectSelect').value, newSubject = $('#newSubjectSelect').value;
        state.invoices.unshift({ id:'INV-'+Date.now().toString().slice(-8), action:`Đổi môn ${oldSubject} → ${newSubject}`, context:`${site.name} · ${round.name}`, amount:50000, beneficiary:'Công ty KH', status:'unpaid', apply:'changeSubject', roundId, payload:{oldSubject,newSubject} });
        closeModals(); renderInvoices(); showStudent('payment'); toast('Đã tạo hóa đơn đổi môn');
      };
      return;
    }

    if (action === 'changeRound') {
      const alternatives = site.rounds.filter(r => r.id !== round.id && r.available > 0);
      content.innerHTML = `<div class="modal-head"><span class="eyebrow">ĐỔI ĐỢT</span><h2>Chuyển khỏi ${round.name}</h2><p>Chỗ hiện tại vẫn được giữ cho đến khi phí đổi đợt thanh toán thành công.</p></div><label>Đợt mới<select id="newRoundSelect">${alternatives.map(r=>`<option value="${r.id}">${r.name} · ${r.date} · còn ${r.available} chỗ</option>`).join('')}</select></label><div class="action-summary"><div><span>Phí đổi đợt</span><strong>50.000 VNĐ</strong></div><div><span>Giữ chỗ đợt mới</span><strong>96 giờ</strong></div><div><span>Người thụ hưởng</span><strong>Công ty KH</strong></div></div><div class="modal-actions"><button class="btn btn-light" data-close-modal>Hủy</button><button class="btn btn-primary" id="confirmChangeRoundBtn">Tạo hóa đơn</button></div>`;
      openModal('actionModal');
      $('#confirmChangeRoundBtn').onclick = () => {
        const targetId = $('#newRoundSelect').value;
        state.invoices.unshift({ id:'INV-'+Date.now().toString().slice(-8), action:`Đổi ${round.name} → ${findRound(targetId).round.name}`, context:site.name, amount:50000, beneficiary:'Công ty KH', status:'unpaid', reservationHours:96, apply:'changeRound', roundId, payload:{targetId} });
        closeModals(); renderInvoices(); showStudent('payment'); toast('Đã giữ chỗ đợt mới trong 96 giờ');
      };
    }
  }

  function openPayment(invoiceId) {
    const inv = state.invoices.find(i => i.id === invoiceId);
    if (!inv || inv.status !== 'unpaid') { toast('Hóa đơn không còn khả dụng', 'warning'); return; }
    $('#paymentModalContent').innerHTML = `<div class="payment-summary"><span class="eyebrow">VIETQR</span><h2>${inv.action}</h2><div class="amount">${fmtMoney(inv.amount)}</div><small>${inv.id}</small></div><div class="qr-demo" aria-label="QR demo"></div><div class="payment-account"><div><span>Người nhận</span><strong>${inv.beneficiary}</strong></div><div><span>Nội dung</span><strong>${inv.id.replaceAll('-','')}</strong></div></div><div class="payment-wait">⏳ Đang chờ xác nhận thanh toán tự động</div><div class="modal-actions"><button class="btn btn-light" data-close-modal>Đóng</button><button class="btn btn-primary" id="simulatePaymentBtn">Mô phỏng thanh toán thành công</button></div>`;
    openModal('paymentModal');
    $('#simulatePaymentBtn').onclick = () => paymentSuccess(inv.id);
  }

  function paymentSuccess(invoiceId) {
    const inv = state.invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    inv.status = 'paid'; inv.paidAt = '11/09/2026 12:45';
    if (inv.apply === 'registration' && inv.roundId) {
      const { round } = findRound(inv.roundId); round.status = 'paid'; delete round.reservedHours;
    }
    if (inv.apply === 'addSubject' && inv.payload) {
      const { round } = findRound(inv.roundId); if (!round.subjects.includes(inv.payload.subject)) round.subjects.push(inv.payload.subject);
    }
    if (inv.apply === 'changeSubject' && inv.payload) {
      const { round } = findRound(inv.roundId); const idx = round.subjects.indexOf(inv.payload.oldSubject); if (idx >= 0) round.subjects[idx] = inv.payload.newSubject;
    }
    if (inv.apply === 'changeRound' && inv.payload) {
      const from = findRound(inv.roundId), to = findRound(inv.payload.targetId);
      if (from && to) { to.round.status = 'paid'; to.round.subjects = [...from.round.subjects]; to.round.available = Math.max(0, to.round.available - 1); from.round.status = 'none'; from.round.subjects = []; from.round.available += 1; }
    }
    if (inv.apply === 'profileChange' && state.pendingProfileChanges) {
      applyProfileChanges(); state.pendingProfileChanges = null;
    }
    closeModals(); renderAllPortal(); toast('Thanh toán thành công. Hành động đã được áp dụng.', 'success');
  }

  function startProfileEdit() {
    state.profileEditing = true;
    $$(`#profileForm input[name], #profileForm select[name]`).forEach(el => el.disabled = false);
    $('#profileEditBtn').classList.add('hidden'); $('#profileSaveBtn').classList.remove('hidden'); $('#profileCancelBtn').classList.remove('hidden');
    toast('Bạn đang chỉnh sửa các trường được phép thay đổi');
  }

  function cancelProfileEdit() {
    state.profileEditing = false;
    $$(`#profileForm input[name], #profileForm select[name]`).forEach(el => el.disabled = true);
    $('#profileEditBtn').classList.remove('hidden'); $('#profileSaveBtn').classList.add('hidden'); $('#profileCancelBtn').classList.add('hidden');
    $('#profileForm').reset();
  }

  function collectProfileChanges() {
    const fd = new FormData($('#profileForm'));
    return Object.fromEntries(fd.entries());
  }

  function applyProfileChanges() {
    const d = state.pendingProfileChanges; if (!d) return;
    Object.entries(d).forEach(([k,v]) => { const el = $(`[name="${k}"]`, $('#profileForm')); if (el) el.value = v; });
  }

  function startOtp(context) {
    $('#otpContext').value = context; $('#otpInput').value = ''; openModal('otpModal');
    state.otpSeconds = 30; clearInterval(state.otpTimer); updateOtpUi();
    state.otpTimer = setInterval(() => { state.otpSeconds -= 1; updateOtpUi(); if (state.otpSeconds <= 0) clearInterval(state.otpTimer); }, 1000);
  }

  function updateOtpUi() {
    $('#otpCountdown').textContent = state.otpSeconds > 0 ? `Gửi lại sau ${state.otpSeconds}s` : 'Có thể gửi lại OTP';
    $('#resendOtpBtn').disabled = state.otpSeconds > 0;
  }

  function profileOtpSuccess() {
    const changes = state.pendingProfileChanges;
    state.invoices.unshift({ id:'INV-'+Date.now().toString().slice(-8), action:'Phí chỉnh sửa thông tin hồ sơ', context:'Hồ sơ thí sinh', amount:50000, beneficiary:'Công ty KH', status:'unpaid', apply:'profileChange' });
    cancelProfileEdit(); closeModals(); renderInvoices(); showStudent('payment'); toast('OTP hợp lệ. Vui lòng thanh toán để áp dụng thay đổi.', 'success');
    state.pendingProfileChanges = changes;
  }

  function openNotification(source, id) {
    const item = state.notifications[source].find(n => n.id === Number(id)); if (!item) return;
    item.unread = false; renderNotifications();
    $('#notificationModalContent').innerHTML = `<div class="modal-head"><span class="eyebrow">${source === 'school' ? 'ĐƠN VỊ TỔ CHỨC THI' : 'HỆ THỐNG'}</span><h2>${item.title}</h2><p>${item.date}</p></div><p>${item.body}</p><div class="modal-actions"><button class="btn btn-primary" data-close-modal>Đóng</button></div>`;
    openModal('notificationModal');
  }

  // Global click handlers
  document.addEventListener('click', e => {
    const pub = e.target.closest('[data-public-view]'); if (pub && !state.loggedIn) { showPublic(pub.dataset.publicView); return; }
    const student = e.target.closest('[data-student-view]'); if (student && state.loggedIn) { showStudent(student.dataset.studentView); return; }
    const open = e.target.closest('[data-open-modal]'); if (open) { openModal(open.dataset.openModal); return; }
    if (e.target.closest('[data-close-modal]')) { closeModals(); return; }
    const siteToggle = e.target.closest('[data-toggle-site]'); if (siteToggle) { const card = siteToggle.closest('.site-card'); card.classList.toggle('open'); siteToggle.lastElementChild.textContent = card.classList.contains('open') ? '⌃' : '⌄'; return; }
    const roundToggle = e.target.closest('[data-toggle-round]'); if (roundToggle) { roundToggle.closest('.round-item').classList.toggle('open'); return; }
    const action = e.target.closest('[data-action]'); if (action && !action.disabled) { openAction(action.dataset.action, action.dataset.round); return; }
    const pay = e.target.closest('[data-pay-invoice]'); if (pay) { openPayment(pay.dataset.payInvoice); return; }
    const notice = e.target.closest('[data-notice-id]'); if (notice) { openNotification(notice.dataset.noticeSource, notice.dataset.noticeId); return; }
  });

  $('#modalBackdrop').addEventListener('click', closeModals);
  $('#mobileMenuBtn').addEventListener('click', () => $('#publicNav').classList.toggle('open'));
  $('#portalMenuBtn').addEventListener('click', () => $('#studentSidebar').classList.toggle('open'));

  // Public tabs
  $$('[data-tab-group] .mini-tab').forEach(btn => btn.addEventListener('click', () => {
    const group = btn.parentElement; $$('.mini-tab', group).forEach(b => b.classList.remove('active')); btn.classList.add('active');
    const container = group.parentElement; $$('.tab-panel', container).forEach(p => p.classList.toggle('active', p.dataset.tabPanel === btn.dataset.tab));
  }));

  $('#locationFilter').addEventListener('change', e => {
    $$('.location-card').forEach(c => c.classList.toggle('hidden', e.target.value !== 'all' && c.dataset.city !== e.target.value));
  });

  $('#loginForm').addEventListener('submit', e => { e.preventDefault(); login(); });
  $('#registerForm').addEventListener('submit', e => { e.preventDefault(); closeModals(); toast('Đã tạo tài khoản demo. Vui lòng xác thực Email.', 'success'); });
  $('#forgotPasswordLink').addEventListener('click', () => { closeModals(); openModal('forgotModal'); });
  $('#forgotForm').addEventListener('submit', e => { e.preventDefault(); closeModals(); startOtp('forgotPassword'); });

  $('#otpForm').addEventListener('submit', e => {
    e.preventDefault();
    if ($('#otpInput').value !== '123456') { toast('OTP không chính xác', 'warning'); return; }
    const context = $('#otpContext').value;
    if (context === 'profileChange') profileOtpSuccess();
    else if (context === 'forgotPassword') { closeModals(); openModal('resetPasswordModal'); }
  });
  $('#resendOtpBtn').addEventListener('click', () => { state.otpSeconds = 30; updateOtpUi(); state.otpTimer = setInterval(() => { state.otpSeconds -= 1; updateOtpUi(); if (state.otpSeconds <= 0) clearInterval(state.otpTimer); }, 1000); toast('Đã gửi lại OTP demo'); });

  $('#profileEditBtn').addEventListener('click', startProfileEdit);
  $('#profileCancelBtn').addEventListener('click', cancelProfileEdit);
  $('#profileForm').addEventListener('submit', e => { e.preventDefault(); state.pendingProfileChanges = collectProfileChanges(); startOtp('profileChange'); });

  $$('[data-notice-tab]').forEach(btn => btn.addEventListener('click', () => { $$('[data-notice-tab]').forEach(b => b.classList.remove('active')); btn.classList.add('active'); state.noticeTab = btn.dataset.noticeTab; renderNotifications(); }));
  $$('[data-account-tab]').forEach(btn => btn.addEventListener('click', () => { $$('[data-account-tab]').forEach(b => b.classList.remove('active')); btn.classList.add('active'); $$('.account-panel').forEach(p => p.classList.toggle('active', p.dataset.accountPanel === btn.dataset.accountTab)); }));

  $('#changePasswordForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Đổi mật khẩu thành công', 'success'); });
  $('#changeEmailForm').addEventListener('submit', e => {
    e.preventDefault();
    const value = $('#newEmailInput').value.trim();
    if (!value) return;
    state.pendingEmail = value;
    $('#emailVerifyText').textContent = `Hệ thống đã gửi link xác thực tới ${value}. Email hiện tại chưa thay đổi.`;
    e.target.reset(); $('#currentEmailInput').value = state.email;
    openModal('emailVerifyModal');
  });
  $('#simulateEmailVerifyBtn').addEventListener('click', () => {
    if (!state.pendingEmail) return;
    state.email = state.pendingEmail; state.pendingEmail = null;
    $('#accountEmailText').textContent = state.email; $('#currentEmailInput').value = state.email;
    closeModals(); toast('Xác thực Email mới thành công. Email chính thức đã được cập nhật.', 'success');
  });
  $('#resetPasswordForm').addEventListener('submit', e => {
    e.preventDefault();
    const p1 = $('#resetNewPassword').value, p2 = $('#resetConfirmPassword').value;
    if (p1 !== p2) { toast('Mật khẩu xác nhận không khớp', 'warning'); return; }
    e.target.reset(); closeModals(); toast('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.', 'success'); openModal('loginModal');
  });
  $('#logoutBtn').addEventListener('click', logout);

  $('#viewSlipBtn').addEventListener('click', () => openModal('slipModal'));
  $('#printSlipBtn').addEventListener('click', () => { openModal('slipModal'); setTimeout(() => window.print(), 200); });
  $('#printSlipModalBtn').addEventListener('click', () => window.print());

  renderAllPortal();
})();
