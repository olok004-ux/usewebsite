/* ============================================================ STATE ============================================================ */
const S = { cur:'splash', hist:[], appPage:'home', appHist:[], carIdx:0, connectMethod:'phone', connectFrom:'easy', authTimer:null, carTimer:null, searchKw:'', connectSvc:'', connectSvcName:'', _signupTimer:null, isConnected:!!localStorage.getItem('useHasVisited') };

const downloaded = new Set(['baemin','starbucks']);

/* ============================================================ NAVIGATION ============================================================ */

// MAIN 화면 탭 전환

// signup-select → main 화면 회원가입 탭으로 리다이렉트

/* ── Signup Form JS (Figma 25:7113) ── */
var suOtpTimer = null;

function suCheckId() {
  var id = document.getElementById('suId') ? document.getElementById('suId').value.trim() : '';
  if (!id) { showToast('아이디를 입력해 주세요'); return; }
  showToast('사용 가능한 아이디입니다 ✓');
}

function suSendOtp() {
  var ph = document.getElementById('suPhone') ? document.getElementById('suPhone').value.trim() : '';
  if (!ph) { showToast('휴대폰 번호를 입력해 주세요'); return; }
  var otpRow   = document.getElementById('suOtpRow');
  var timerRow = document.getElementById('suTimerRow');
  var sendBtn  = document.getElementById('suSendBtn');
  if (otpRow)   otpRow.style.display   = 'flex';
  if (timerRow) timerRow.style.display = 'flex';
  if (sendBtn)  sendBtn.classList.add('active');
  suStartTimer(55);
  showToast('인증번호가 발송되었습니다');
}

function suVerifyOtp() {
  var otp = document.getElementById('suOtp') ? document.getElementById('suOtp').value.trim() : '';
  if (!otp || otp.length < 4) { showToast('인증번호를 입력해 주세요'); return; }
  clearInterval(suOtpTimer);
  var btn = document.getElementById('suVerifyBtn');
  if (btn) { btn.textContent = '인증완료 ✓'; btn.classList.add('active'); }
  showToast('인증이 완료되었습니다');
}

function suStartTimer(sec) {
  clearInterval(suOtpTimer);
  var el = document.getElementById('suTimer');
  var s = sec;
  if (el) el.textContent = s + '초';
  suOtpTimer = setInterval(function() {
    s--;
    if (el) el.textContent = s + '초';
    if (s <= 0) { clearInterval(suOtpTimer); if (el) el.textContent = '만료'; }
  }, 1000);
}

function suComplete() {
  var id  = document.getElementById('suId')           ? document.getElementById('suId').value.trim()           : '';
  var pw  = document.getElementById('signupPw')       ? document.getElementById('signupPw').value.trim()       : '';
  var pwc = document.getElementById('signupPwConfirm')? document.getElementById('signupPwConfirm').value.trim(): '';
  if (!id || !pw || !pwc) { showToast('모든 항목을 입력해 주세요'); return; }
  if (pw !== pwc) { showToast('비밀번호가 일치하지 않습니다'); return; }
  S.isConnected = true;
  localStorage.setItem('useHasVisited', '1');
  go('signup-complete');
}


function filterHmCpn(cat, btn) {
  // 탭 활성화
  document.querySelectorAll('.hm-tab').forEach(function(t){ t.classList.remove('on'); });
  if (btn) btn.classList.add('on');
  // 카드 표시/숨김
  document.querySelectorAll('.hm-h4-card').forEach(function(c){
    var cc = c.dataset.cat;
    var show = (cat === 'all') || (cc === cat) || (cc === 'both');
    c.style.display = show ? 'flex' : 'none';
    c.style.flexDirection = show ? 'column' : '';
  });
  // 결과 없음
  var visible = document.querySelectorAll('.hm-h4-card:not([style*="display: none"])');
  var noRes = document.getElementById('hmNoResult');
  if (noRes) noRes.style.display = visible.length === 0 ? 'block' : 'none';
}

function normalizeHomeCardConditions() {
  document.querySelectorAll('.hm-card-cond').forEach(function(el) {
    var text = (el.textContent || '').trim();
    if (text === '조건 없음' || text === '사용 조건 없음' || text === '없음') {
      el.textContent = '';
    }
  });
}

function goHome() {
  go('home');
}

function startLinkingTimer() {
  setTimeout(function() {
    go('loading-result');
  }, 3000);
}

function goSignupSelect() {
  go('main');
  setTimeout(function() { switchMainTab('signup'); }, 50);
}

function termsRows(group) {
  return Array.from(document.querySelectorAll('#s-terms-new .terms-item-row[data-group="' + group + '"]'));
}

function termsAllRows() {
  return Array.from(document.querySelectorAll('#s-terms-new .terms-item-row[data-group]'));
}

function termsSetRows(rows, checked) {
  rows.forEach(row => row.classList.toggle('on', checked));
}

function termsUpdateChecks() {
  const requiredRows = termsRows('required');
  const identityRows = termsRows('identity');
  const allRows = termsAllRows();
  const requiredOn = requiredRows.length > 0 && requiredRows.every(row => row.classList.contains('on'));
  const identityOn = identityRows.length > 0 && identityRows.every(row => row.classList.contains('on'));
  const allOn = allRows.length > 0 && allRows.every(row => row.classList.contains('on'));

  const chkRequired = document.getElementById('chkRequired');
  const chkIdentity = document.getElementById('chkIdentity');
  const chkAll = document.getElementById('chkAll');
  if (chkRequired) chkRequired.classList.toggle('on', requiredOn);
  if (chkIdentity) chkIdentity.classList.toggle('on', identityOn);
  if (chkAll) chkAll.classList.toggle('on', allOn);
}

function termsToggleAll() {
  const allRows = termsAllRows();
  const shouldCheck = !allRows.every(row => row.classList.contains('on'));
  termsSetRows(allRows, shouldCheck);
  termsUpdateChecks();
}

function termsToggleGroup(group) {
  const rows = termsRows(group);
  const shouldCheck = !rows.every(row => row.classList.contains('on'));
  termsSetRows(rows, shouldCheck);
  termsUpdateChecks();
}

function termsToggleItem(row) {
  if (!row) return;
  row.classList.toggle('on');
  termsUpdateChecks();
}

function switchMainTab(tab) {
  const loginPanel  = document.getElementById('main-login-panel');
  const signupPanel = document.getElementById('main-signup-panel');
  const tabLogin    = document.getElementById('tab-login');
  const tabSignup   = document.getElementById('tab-signup');
  const mainScreen  = document.querySelector('#s-main .main-screen');
  if (tab === 'login') {
    loginPanel.style.display  = 'flex';
    signupPanel.style.display = 'none';
    tabLogin.classList.add('on');
    tabSignup.classList.remove('on');
    mainScreen.classList.remove('signup-mode');
    mainScreen.classList.add('login-mode');
  } else {
    loginPanel.style.display  = 'none';
    signupPanel.style.display = 'flex';
    tabLogin.classList.remove('on');
    tabSignup.classList.add('on');
    mainScreen.classList.remove('login-mode');
    mainScreen.classList.add('signup-mode');
  }
}

function go(id, back) {
  const appPages = {home:1,download:1,wallet:1,detail:1,barcode:1,mypage:1,'connect-svc-select':1,'connect':1,'connect-easy':1,'connect-manual':1,'connect-manual-form':1,'connect-auth':1,'connect-success':1,'connect-fail':1,search:1,'noti-alert':1,'points-hub':1,'points-service':1,'noti-page':1,'noti-brand':1,'noti-custom-setup':1,'noti-auto-setup':1};
  if (appPages[id]) {
    document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('active');s.style.display='none';});
    const shell = document.getElementById('app-shell');
    shell.classList.add('active'); shell.style.display='flex';
    const tb = document.getElementById('bottomTabBar');
    if (tb) tb.style.display = 'flex';
    showAppPage(id); updateSidebar(id); return;
  }
  if (!back) S.hist.push(S.cur);
  document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('active');s.style.display='none';});
  // 온보딩 화면 진입 시 앱쉘·탭바 숨김
  const _shell = document.getElementById('app-shell');
  if (_shell) { _shell.classList.remove('active'); _shell.style.display = 'none'; }
  const _tb = document.getElementById('bottomTabBar');
  if (_tb) _tb.style.display = 'none';
  const next = document.getElementById('s-'+id);
  if (next) { next.style.display='block'; next.classList.add('active'); }
  S.cur = id;
  if (id==='loading') startLinkingTimer();
  if (id==='signup-complete') {
    setTimeout(function(){ if (S.cur==='signup-complete') go('signup-done'); }, 1800);
  }
  if (id==='svc-intro') {
    setTimeout(function(){ if (S.cur==='svc-intro') go('svc-loading2'); }, 1800);
  }
  if (id==='svc-loading2') {
    setTimeout(function(){ if (S.cur==='svc-loading2') go('svc-complete'); }, 2000);
  }
  if (id==='coupon-intro') {
    setTimeout(function(){ if (S.cur==='coupon-intro') go('coupon-complete'); }, 3000);
  }
}
/* ═══════════════════════════════════════════════════════
   중앙 데이터 — coupon_30.csv + point_list.csv
   기준일: 2026-06-01
   ═══════════════════════════════════════════════════════ */
const USE_COUPONS = [
  { id:'CP-001', brand:'스타벅스',    cat:'카페/디저트',  name:'아메리카노 교환권',          discType:'정액', benefit:4500,  expiry:'2026-06-30', channel:'오프라인',   place:'전국 매장 및 사이렌오더',            cond:'없음',                          split:false, barcode:true,  fav:true  },
  { id:'CP-002', brand:'투썸플레이스',cat:'카페/디저트',  name:'제조음료 1+1 쿠폰',          discType:'정률', benefit:50,   expiry:'2026-08-31', channel:'오프라인',   place:'전국 매장 및 사이렌오더',            cond:'동일 음료 주문 시',             split:false, barcode:true,  fav:false },
  { id:'CP-003', brand:'이디야커피',  cat:'카페/디저트',  name:'사이렌오더 1천원 할인',        discType:'정액', benefit:1000, expiry:'2026-09-30', channel:'온라인',    place:'스타벅스 앱 전용',                   cond:'5000원 이상 결제 시',           split:false, barcode:false, fav:false },
  { id:'CP-004', brand:'메가커피',    cat:'카페/디저트',  name:'MD 상품 10% 할인권',          discType:'정률', benefit:10,   expiry:'2026-07-31', channel:'오프라인',  place:'전국 매장(일부 특수매장 제외)',       cond:'텀블러 및 머그 구매 시',        split:false, barcode:true,  fav:false },
  { id:'CP-005', brand:'공차',        cat:'카페/디저트',  name:'모바일 기프트카드 3만원권',    discType:'정액', benefit:30000,expiry:'2026-06-03', channel:'온라인',    place:'전국 매장 및 공식 앱',               cond:'없음',                          split:true,  barcode:true,  fav:false },
  { id:'CP-006', brand:'나이키',      cat:'패션/의류',    name:'아웃렛 매장 추가 10% 쿠폰',   discType:'정률', benefit:10,   expiry:'2027-05-19', channel:'온오프라인',place:'전국 팩토리 아웃렛',                  cond:'아웃렛 할인가에 추가 적용',     split:false, barcode:true,  fav:true  },
  { id:'CP-007', brand:'아디다스',    cat:'패션/의류',    name:'현대카드 결제 3천원 중복권',   discType:'정액', benefit:3000, expiry:'2026-11-30', channel:'온오프라인',place:'주문서 결제창',                       cond:'현대카드로 5만원 이상 결제 시', split:false, barcode:false, fav:false },
  { id:'CP-008', brand:'무신사',      cat:'패션/의류',    name:'모바일 앱 신규 3천원 쿠폰',   discType:'정액', benefit:3000, expiry:'2026-12-31', channel:'온오프라인',place:'전국 매장 및 온라인 스토어',          cond:'3만원 이상 구매 시',            split:false, barcode:true,  fav:false },
  { id:'CP-009', brand:'유니클로',    cat:'패션/의류',    name:'공식몰 가입 환영 쿠폰',        discType:'정률', benefit:10,   expiry:'2026-06-30', channel:'온라인',    place:'공식 온라인 스토어',                  cond:'첫 구매 회원 한정',             split:false, barcode:false, fav:false },
  { id:'CP-010', brand:'ZARA',        cat:'패션/의류',    name:'생일 축하 2만원 할인권',        discType:'정액', benefit:20000,expiry:'2026-08-31', channel:'온오프라인',place:'공식몰 및 오프라인 직영점',           cond:'10만원 이상 구매 시',           split:false, barcode:true,  fav:false },
  { id:'CP-011', brand:'올리브영',    cat:'뷰티/건강',    name:'기프트카드 5만원 충전권',       discType:'정액', benefit:50000,expiry:'2026-09-30', channel:'온오프라인',place:'전국 매장 및 온라인몰',              cond:'없음',                          split:true,  barcode:true,  fav:true  },
  { id:'CP-012', brand:'다이소',      cat:'리빙/마트',    name:'마트 직송 8천원 할인쿠폰',      discType:'정액', benefit:8000, expiry:'2026-07-31', channel:'온라인',    place:'온라인몰',                            cond:'8만원 이상 주문 시',            split:false, barcode:false, fav:false },
  { id:'CP-013', brand:'이마트',      cat:'리빙/마트',    name:'e머니 5천점 적립 쿠폰',         discType:'정액', benefit:5000, expiry:'2026-06-04', channel:'오프라인',  place:'전국 매장',                           cond:'7만원 이상 결제 시',            split:false, barcode:true,  fav:false },
  { id:'CP-014', brand:'홈플러스',    cat:'리빙/마트',    name:'모바일 금액상품권 1만원권',     discType:'정액', benefit:10000,expiry:'2027-05-19', channel:'오프라인',  place:'전국 편의점 매장',                    cond:'서비스 품목 제외',              split:true,  barcode:true,  fav:false },
  { id:'CP-015', brand:'GS25',        cat:'리빙/마트',    name:'연세우유 크림빵 500원 할인',    discType:'정액', benefit:500,  expiry:'2026-11-30', channel:'오프라인',  place:'전국 편의점 매장',                    cond:'연세우유 디저트 시리즈 전체',   split:false, barcode:true,  fav:true  },
  { id:'CP-016', brand:'CU',          cat:'리빙/마트',    name:'수입맥주 골라담기 2천원권',     discType:'정액', benefit:2000, expiry:'2026-12-31', channel:'오프라인',  place:'전국 마트 매장',                      cond:'수입맥주 4캔 이상 구매 시',     split:false, barcode:true,  fav:false },
  { id:'CP-017', brand:'배달의민족',  cat:'푸드/배달',    name:'가게배달 중복 15% 쿠폰',        discType:'정률', benefit:15,   expiry:'2026-06-30', channel:'온라인',    place:'모바일 배달 앱',                      cond:'쿠폰 마크 부착 매장 주문 시',   split:false, barcode:false, fav:true  },
  { id:'CP-018', brand:'요기요',      cat:'푸드/배달',    name:'배달 전용 무료배송 티켓',        discType:'정액', benefit:3000, expiry:'2026-08-31', channel:'온라인',    place:'모바일 배달 앱',                      cond:'배달 서비스 이용 시 배달비 면제',split:false, barcode:false, fav:false },
  { id:'CP-019', brand:'쿠팡이츠',    cat:'푸드/배달',    name:'포장 주문 전용 1천원 쿠폰',     discType:'정액', benefit:1000, expiry:'2026-09-30', channel:'온라인',    place:'모바일 배달 앱',                      cond:'1만2천원 이상',                 split:false, barcode:false, fav:false },
  { id:'CP-020', brand:'BBQ',         cat:'푸드/배달',    name:'첫 주문 총 2만원 패키지권',      discType:'정액', benefit:5000, expiry:'2026-07-31', channel:'온라인',    place:'모바일 배달 앱',                      cond:'신규 가입 즉시 지급',           split:false, barcode:false, fav:false },
  { id:'CP-021', brand:'BHC',         cat:'푸드/배달',    name:'황금올리브치킨 2천원 할인',      discType:'정액', benefit:2000, expiry:'2026-06-06', channel:'온라인',    place:'공식 앱 및 매장전화',                 cond:'황금올리브 치킨 한정',          split:false, barcode:true,  fav:false },
  { id:'CP-022', brand:'도미노피자',  cat:'푸드/배달',    name:'사이드메뉴 무료증정 쿠폰',      discType:'정액', benefit:5000, expiry:'2027-05-19', channel:'온라인',    place:'공식 앱 및 매장 주문',               cond:'치킨 메인 메뉴 1마리 이상',     split:false, barcode:true,  fav:false },
  { id:'CP-023', brand:'CGV',         cat:'문화/여가',    name:'기프트샵 5천원 기념품 쿠폰',     discType:'정액', benefit:5000, expiry:'2026-11-30', channel:'오프라인',  place:'원내 상품점',                         cond:'3만원 이상 기념품 구매 시',     split:false, barcode:true,  fav:false },
  { id:'CP-024', brand:'롯데시네마',  cat:'문화/여가',    name:'평일 주중 영화 35% 할인',        discType:'정률', benefit:35,   expiry:'2026-12-31', channel:'온라인',    place:'모바일 앱 예매',                      cond:'월~목 상영 영화 예매 시',       split:false, barcode:false, fav:false },
  { id:'CP-025', brand:'메가박스',    cat:'문화/여가',    name:'일반 영화 3천원 할인권',          discType:'정액', benefit:3000, expiry:'2026-06-30', channel:'온라인',    place:'상영관 앱 및 현장 무인발권기',        cond:'2D 일반 영화 좌석 대상',        split:false, barcode:true,  fav:false },
  { id:'CP-026', brand:'에버랜드',    cat:'문화/여가',    name:'특별관 4천원 할인권',             discType:'정액', benefit:4000, expiry:'2026-08-31', channel:'온라인',    place:'모바일 앱 예매',                      cond:'IMAX/돌비 등 특별 상영관',      split:false, barcode:false, fav:false },
  { id:'CP-027', brand:'롯데월드',    cat:'문화/여가',    name:'매점 팝콘(L) 2천원 할인권',       discType:'정액', benefit:2000, expiry:'2026-09-30', channel:'온오프라인',place:'매점 및 패스트오더',                  cond:'팝콘 라지 사이즈 단품 구매 시', split:false, barcode:true,  fav:false },
  { id:'CP-028', brand:'교보문고',    cat:'도서/교육',    name:'문구 10% 할인권',                 discType:'정률', benefit:10,   expiry:'2026-07-31', channel:'오프라인',  place:'매장 내 문구 코너',                   cond:'필기구 및 디자인 문구 1만원 이상',split:false, barcode:true,  fav:false },
  { id:'CP-029', brand:'예스24',      cat:'도서/교육',    name:'도서 무료 배송 티켓',              discType:'정액', benefit:2500, expiry:'2026-06-07', channel:'온라인',    place:'온라인 공식 몰',                      cond:'도서 정가제 적용 1만원 이상',   split:false, barcode:false, fav:false },
  { id:'CP-030', brand:'알라딘',      cat:'도서/교육',    name:'중고서점 오프라인 3천원권',       discType:'정액', benefit:3000, expiry:'2027-05-19', channel:'오프라인',  place:'오프라인 중고매장',                   cond:'중고도서 2만원 이상 구매 시',   split:false, barcode:true,  fav:false },
];

const USE_POINTS = [
  { id:'PT-001', name:'네이버페이 포인트',    issuer:'네이버',      balance:12500, expiry:'2026-12-31', places:'네이버쇼핑, 스마트스토어, GS25, CU, 세븐일레븐, 이마트24, 이디야, 배스킨라빈스, 파리바게뜨 등', split:true  },
  { id:'PT-002', name:'엘포인트 (L.POINT)',   issuer:'롯데멤버스',   balance:5400,  expiry:'2027-05-15', places:'롯데마트, 롯데백화점, 롯데시네마, 롯데월드, 롯데리아 등',                                          split:true  },
  { id:'PT-003', name:'CJ ONE 포인트',        issuer:'CJ올리브네트웍스', balance:3200, expiry:'2026-09-30', places:'올리브영, CGV, 뚜레쥬르, 투썸플레이스, 빕스 등',                                            split:true  },
  { id:'PT-004', name:'해피포인트',            issuer:'SPC그룹',      balance:4150,  expiry:'2026-06-30', places:'파리바게뜨, 배스킨라빈스, 던킨, 파스쿠찌 등',                                                  split:true  },
  { id:'PT-005', name:'GS앤포인트',            issuer:'GS리테일',     balance:2800,  expiry:'2026-11-30', places:'GS25, GS더프레시, GS칼텍스, GS샵 등',                                                         split:true  },
  { id:'PT-006', name:'신세계포인트',           issuer:'신세계그룹',   balance:15300, expiry:'2027-02-28', places:'이마트, 신세계백화점, SSG.COM, 스타필드 등',                                                   split:true  },
  { id:'PT-007', name:'H.Point',               issuer:'현대백화점',   balance:7600,  expiry:'2026-10-31', places:'현대백화점, 현대아울렛, 현대홈쇼핑 등',                                                        split:true  },
  { id:'PT-008', name:'다이소 멤버십 포인트',  issuer:'아성다이소',   balance:950,   expiry:'2027-12-31', places:'전국 다이소 매장 및 다이소몰',                                                                  split:true  },
  { id:'PT-009', name:'배민포인트',             issuer:'우아한형제들', balance:3000,  expiry:'2026-07-31', places:'배달의민족, B마트, 배민스토어 등',                                                             split:true  },
  { id:'PT-010', name:'스타벅스 리워드 별',    issuer:'스타벅스',     balance:12,    expiry:'2026-08-31', places:'스타벅스 매장 및 사이렌오더',                                                                   split:false },
];

/* ── 유틸 함수 ── */
const TODAY = new Date('2026-06-01');

function cpnDday(expiry) {
  const diff = Math.ceil((new Date(expiry) - TODAY) / 86400000);
  if (diff < 0)  return '만료';
  if (diff === 0) return 'D-Day';
  return 'D-' + diff;
}
function cpnDdayNum(expiry) {
  return Math.ceil((new Date(expiry) - TODAY) / 86400000);
}
function cpnBenefitLabel(c) {
  return c.discType === '정률' ? c.benefit + '%' : c.benefit.toLocaleString() + '원';
}
function cpnChannelBadge(channel) {
  if (channel === '온라인')    return '온라인';
  if (channel === '오프라인')  return '오프라인';
  return '온·오프';
}
/* 브랜드 아이콘 첫 글자(한글/영문) */
function cpnInitial(brand) {
  return brand.charAt(0);
}
/* 브랜드별 배경색 */
const BRAND_COLORS = {
  '스타벅스':'#00704A','투썸플레이스':'#c8a26b','이디야커피':'#0052a5','메가커피':'#f5a623','공차':'#3c6e47',
  '나이키':'#111','아디다스':'#000','무신사':'#222','유니클로':'#E40012','ZARA':'#000',
  '올리브영':'#00a862','다이소':'#e63022','이마트':'#E8440A','홈플러스':'#0052a5','GS25':'#0099d9',
  'CU':'#7d4a9a','배달의민족':'#2AC1BC','요기요':'#fa2038','쿠팡이츠':'#c00f1e','BBQ':'#f26522',
  'BHC':'#e30613','도미노피자':'#006491','CGV':'#e40612','롯데시네마':'#e40028','메가박스':'#000',
  '에버랜드':'#007c3e','롯데월드':'#e4071b','교보문고':'#003399','예스24':'#e40000','알라딘':'#0071bc',
};
function cpnBgColor(brand) { return BRAND_COLORS[brand] || '#667085'; }

/* 만료 임박 쿠폰 (30일 내) */
function cpnExpiringSoon(days) { return USE_COUPONS.filter(c => { const d = cpnDdayNum(c.expiry); return d >= 0 && d <= days; }); }

/* 찜한 쿠폰 */
function cpnFaved() { return USE_COUPONS.filter(c => c.fav); }

function goBack() {
  // 앱 쉘이 활성화 되어 있으면 앱 페이지 히스토리에서 뒤로
  const shell = document.getElementById('app-shell');
  if (shell && (shell.style.display === 'flex' || shell.classList.contains('active'))) {
    if (S.appHist.length) {
      const prev = S.appHist.pop();
      showAppPage(prev, true); // skipHistory=true 로 중복 push 방지
      updateSidebar(prev);
      // mypage 탭 연동
      // mypage 복귀 시 서브패널은 자동으로 열지 않음
    }
    return;
  }
  // 온보딩 화면에서는 기존 screen 히스토리 사용
  if (S.hist.length) go(S.hist.pop(), true);
}


function showNotiSetupPopup() {
  go('home');
  setTimeout(function() {
    var popup = document.getElementById('notiSetupPopup');
    if (!popup) return;
    popup.classList.add('show');
    popup.setAttribute('aria-hidden', 'false');
  }, 120);
}

function dismissNotiSetupPopup() {
  var popup = document.getElementById('notiSetupPopup');
  if (!popup) return;
  popup.classList.remove('show');
  popup.setAttribute('aria-hidden', 'true');
}

function goNotiSetupSettings() {
  dismissNotiSetupPopup();
  showAppPage('noti-custom-setup');
  updateSidebar('');
}

function showSocialLogin(provider) {
  const cfg = {
    kakao: { label:'카카오', bg:'#FEE500', color:'#3A1D00', btnText:'카카오 계정으로 로그인', logo:'K' },
    naver: { label:'네이버', bg:'#03C75A', color:'white',   btnText:'네이버 계정으로 로그인', logo:'N' },
    toss:  { label:'토스',   bg:'#0064FF', color:'white',   btnText:'토스 계정으로 로그인',   logo:'T' }
  };
  const c = cfg[provider];
  document.getElementById('social-login-logo').style.background = c.bg;
  document.getElementById('social-login-logo').style.color = c.color;
  document.getElementById('social-login-logo').textContent = c.logo;
  document.getElementById('social-login-title').textContent = c.label + ' 로그인';
  document.getElementById('social-login-sub').textContent = c.label + ' 계정으로 USE에 로그인하세요';
  const btn = document.getElementById('social-login-btn');
  btn.textContent = c.btnText;
  btn.style.background = c.bg;
  btn.style.color = c.color;
  go('social-login');
}
function showAppPage(id, skipHistory) {
  // 홈이 아닌 페이지로 이동할 때 추천 캐러셀 자동 타이머 정지
  if (id !== 'home') stopRecAuto();
  if (S.easyTimer && id !== 'connect-easy') {
    clearTimeout(S.easyTimer);
    S.easyTimer = null;
  }

  // 바코드 팝업·brightness 필터 항상 초기화 (어느 경로로 나가든 잔류 방지)
  const _popup = document.getElementById('brcInstantPopup');
  if (_popup) _popup.classList.remove('show');
  document.documentElement.style.filter = '';

  if (!skipHistory && S.appPage && S.appPage !== id) {
    S.appHist.push(S.appPage);
    if (S.appHist.length > 30) S.appHist.shift();
  }
  S.appPage = id;
  /* 페이지 진입 시 데이터 렌더링 갱신 */
  if (id === 'home')        { setTimeout(()=>{ renderHomeCarousel(); renderHomeList(); renderHomeStats(); }, 30); }
  if (id === 'points-hub')  { setTimeout(()=>{ renderPhCpnList(); renderPhPtsList(); }, 30); }
  if (id === 'wishlist')    { setTimeout(()=>renderWishlist(), 30); }
  if (id === 'noti-page')   { setTimeout(()=>renderNotifications(), 30); }
  document.querySelectorAll('.app-page').forEach(p => { p.style.display = 'none'; p.classList.remove('ptsvc-open'); });
  const page = document.getElementById('p-'+id);
  const _flexPages = {'noti-alert':1,'noti-page':1,'noti-brand':1,'wishlist':1,'points-service':1};
  if (page) {
    if (id === 'points-service') {
      page.classList.add('ptsvc-open');
    } else {
      page.style.display = _flexPages[id] ? 'flex' : 'block';
    }
    page.classList.add('fade-in');
  }
  // 상세 페이지: 탭바·헤더 숨김 + 플로팅 버튼 표시 / 그 외: 반대
  const _tb2  = document.getElementById('bottomTabBar');
  const _fb   = document.getElementById('detFloatBar');
  const hdr = document.querySelector('.app-header');
  if (id === 'detail') {
    if (_tb2) _tb2.style.display = 'flex';
    if (_fb)  _fb.classList.remove('show');
    if (hdr)  hdr.style.display = 'none';
    const _ab = document.querySelector('.app-body');
    if (_ab) _ab.style.paddingTop = '0';
    const _mc = document.querySelector('.main-content');
    if (_mc) _mc.style.paddingBottom = '0';
  } else if (id === 'noti-alert') {
    if (_tb2) _tb2.style.display = 'flex';
    if (_fb)  _fb.classList.remove('show');
    if (hdr)  hdr.style.display = 'none';
    const _ab = document.querySelector('.app-body');
    if (_ab) _ab.style.paddingTop = '0';
    const _mc = document.querySelector('.main-content');
    if (_mc) _mc.style.paddingBottom = '0';
  } else if (id === 'home-empty') {
    if (_tb2) _tb2.style.display = 'none';
    if (_fb)  _fb.classList.remove('show');
    if (hdr)  hdr.style.display = '';
  } else if (id === 'noti-brand') {
    if (_tb2) _tb2.style.display = 'flex';
    if (_fb)  _fb.classList.remove('show');
    if (hdr)  hdr.style.display = 'none';
    const _ab = document.querySelector('.app-body');
    if (_ab) _ab.style.paddingTop = '0';
    const _mc = document.querySelector('.main-content');
    if (_mc) {
      _mc.style.padding = '0';
      _mc.scrollTop = 0;
      _mc.scrollLeft = 0;
    }
    if (page) {
      page.scrollTop = 0;
      page.scrollLeft = 0;
      if (page.scrollTo) page.scrollTo(0, 0);
    }
    const _nbScroll = document.getElementById('nbScrollArea');
    if (_nbScroll) {
      _nbScroll.scrollTop = 0;
      _nbScroll.scrollLeft = 0;
    }
  } else if (id === 'noti-auto-setup' || id === 'noti-custom-setup') {
    if (_tb2) _tb2.style.display = 'none';
    if (_fb)  _fb.classList.remove('show');
    if (hdr)  hdr.style.display = '';
  } else if (id === 'connect-svc-select' || id === 'connect' || id === 'connect-easy' || id === 'connect-manual' || id === 'connect-manual-form' || id === 'connect-success') {
    if (_tb2) _tb2.style.display = 'none';
    if (_fb)  _fb.classList.remove('show');
    if (hdr)  hdr.style.display = 'none';
    const _ab = document.querySelector('.app-body');
    if (_ab) _ab.style.paddingTop = '0';
    const _mc = document.querySelector('.main-content');
    if (_mc) {
      _mc.style.padding = '0';
      _mc.scrollTop = 0;
      _mc.scrollLeft = 0;
    }
    if (page) {
      page.scrollTop = 0;
      page.scrollLeft = 0;
      if (page.scrollTo) page.scrollTo(0, 0);
    }
  } else if (id === 'mypage') {
    if (_tb2) _tb2.style.display = 'flex';
    if (_fb)  _fb.classList.remove('show');
    if (hdr)  hdr.style.display = 'none';
    const _ab = document.querySelector('.app-body');
    if (_ab) _ab.style.paddingTop = '0';
    const _mc = document.querySelector('.main-content');
    if (_mc) _mc.style.paddingBottom = '0';
  } else if (id === 'home') {
    // 홈 화면: 임베디드 앱바 사용 → app-header 숨김 (Figma 594:10719)
    if (_tb2) _tb2.style.display = 'flex';
    if (_fb)  _fb.classList.remove('show');
    if (hdr)  hdr.style.display = 'none';
    const _ab = document.querySelector('.app-body');
    if (_ab) _ab.style.paddingTop = '0';
    const _mc = document.querySelector('.main-content');
    if (_mc) { _mc.style.padding = ''; _mc.style.paddingBottom = ''; }
    // 탭 초기화: 전체 선택
    filterHmCpn('all', document.querySelector('.hm-tab[data-cat="all"]'));
  } else {
    if (_tb2) _tb2.style.display = 'flex';
    if (_fb)  _fb.classList.remove('show');
    if (hdr)  hdr.style.display = '';
    const _ab = document.querySelector('.app-body');
    if (_ab) _ab.style.paddingTop = '';
    const _mc = document.querySelector('.main-content');
    if (_mc) {
      _mc.style.padding = '';
      _mc.style.paddingBottom = '';
    }
  }
  // 홈 화면에서만 지도·포인트 탭 숨김
  if (hdr) hdr.classList.toggle('on-home', id === 'home' || id === 'home-empty');
  // 페이지 전환 시 항상 최상단으로 스크롤 리셋
  const mc = document.querySelector('.main-content');
  if (mc) { mc.scrollTop = 0; mc.scrollLeft = 0; }
  if (id==='barcode') drawBRC();
  if (id==='detail') drawDetBRC();
  if (id==='connect-manual') {
    if (!S.connectMethod) S.connectMethod = 'account';
    document.querySelectorAll('#p-connect-manual .connect-manual-card').forEach(el => {
      el.classList.toggle('sel', el.dataset.method === S.connectMethod);
    });
  }
  if (id==='connect-manual-form') {
    if (!S.connectMethod) S.connectMethod = 'account';
    updateConnectForm();
  }
  if (id==='connect-easy') {
    S.connectFrom = 'easy';
    S.easyTimer = setTimeout(() => {
      S.easyTimer = null;
      if (S.appPage !== 'connect-easy') return;
      showAppPage('connect-success');
      const el = document.getElementById('caSuccessCount');
      if (el) {
        let n = 0;
        el.textContent = '0';
        const t = setInterval(() => {
          el.textContent = ++n;
          if (n >= 12) clearInterval(t);
        }, 60);
      }
    }, 2200);
  }
  if (id==='home') {
    initCarousel();
    // 홈 진입 시 검색·채널·카테고리 초기화
    const inp = document.getElementById('searchInput');
    if (inp) inp.value = '';
    const bigInp = document.getElementById('homeBigSearch');
    if (bigInp) bigInp.value = '';
    _homeCh = 'all';
    _homeSvc = 'all';
    _homeBrand = 'all';
    initRecCarousel();
    startRollingTitle();
    document.querySelectorAll('.hct-btn').forEach(b => b.classList.toggle('on', b.dataset.cat === 'all'));
    document.querySelectorAll('#homeCatChips .home-cat-chip').forEach(c => c.classList.toggle('sel', c.dataset.svc === 'all'));
    document.querySelectorAll('#homeCatChips .home-cat-chip-v2').forEach(c => c.classList.toggle('sel', c.dataset.svc === 'all'));
    const hsbSel = document.getElementById('hsbCatSel'); if (hsbSel) hsbSel.value = 'all';
    renderHomeBrandRow('all');
    // pill 위치는 레이아웃 계산 후 이동
    requestAnimationFrame(() => {
      const firstBtn = document.querySelector('#homeCatTabs .hct-btn.on');
      moveSegPill(firstBtn);
    });
    _applyHomeFilter();
  }
  if (id==='points-hub') initPointsHub();
}
function updateSidebar(id) {
  document.querySelectorAll('.hdr-nav-item').forEach(i=>i.classList.remove('on'));
  document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('on'));
  const hdrMap = {home:0,'noti-alert':1,'points-hub':2};
  const hdrItems = document.querySelectorAll('.hdr-nav-item');
  if (hdrMap[id]!==undefined && hdrItems[hdrMap[id]]) hdrItems[hdrMap[id]].classList.add('on');
  const sbMap = {home:0,'noti-alert':1,wallet:2};
  const sbItems = document.querySelectorAll('.sb-item');
  if (sbMap[id]!==undefined && sbItems[sbMap[id]]) sbItems[sbMap[id]].classList.add('on');
  document.querySelectorAll('.tab-bar-item').forEach(t=>t.classList.remove('on'));
  const tabMap={home:'home','noti-alert':'noti-alert','points-hub':'points-hub',wishlist:'wishlist',mypage:'mypage'};
  const tabEl=document.querySelector('.tab-bar-item[data-tab="'+(tabMap[id]||'')+'"]');
  if(tabEl)tabEl.classList.add('on');
}

/* ── 홈 세그먼트 pill 위치 이동 ── */
function moveSegPill(btn) {
  const pill = document.getElementById('homeSegPill');
  if (!pill || !btn) return;
  const wrap = btn.closest('.home-channel-tabs');
  if (!wrap) return;
  const wRect = wrap.getBoundingClientRect();
  const bRect = btn.getBoundingClientRect();
  pill.style.left  = (bRect.left - wRect.left) + 'px';
  pill.style.width = bRect.width + 'px';
}

/* ── 홈 쿠폰 채널 필터 ── */
let _homeCh = 'all';

function filterHomeCpn(ch, btn) {
  _homeCh = ch;
  document.querySelectorAll('.hct-btn').forEach(b => b.classList.remove('on'));
  if (btn) { btn.classList.add('on'); moveSegPill(btn); }
  _applyHomeFilter();
}

function homeSearch(kw) {
  // 홈 페이지가 활성화된 상태일 때만 인라인 필터링
  const homePage = document.getElementById('p-home');
  if (homePage && homePage.style.display !== 'none') {
    _applyHomeFilter();
  }
}

function _applyHomeFilter() {
  const kw = (
    document.getElementById('homeBigSearch')?.value ||
    document.getElementById('searchInput')?.value || ''
  ).trim().toLowerCase();
  const noResult = document.getElementById('homeNoResult');
  let anyVisible = false;

  // Support old and new card types
  document.querySelectorAll('#homeCpnGrid .home-cpn-card, #homeCpnGrid .hcc-v2, #homeCpnGrid .hct-card').forEach(card => {
    const cat   = card.dataset.cat || '';
    const svc   = card.dataset.svc || '';
    const cid   = card.dataset.id  || '';
    const brand = (card.querySelector('.hcc-brand, .hcc-v2-brand, .hct-brand')?.textContent || '').toLowerCase();
    const title = (card.querySelector('.hcc-title, .hcc-v2-name, .hct-title')?.textContent || '').toLowerCase();
    const matchCh    = _homeCh    === 'all' || cat === _homeCh;
    const matchSvc   = _homeSvc   === 'all' || svc === _homeSvc;
    const matchBrand = _homeBrand === 'all' || cid === _homeBrand;
    const matchKw    = !kw || brand.includes(kw) || title.includes(kw);
    const show = matchCh && matchSvc && matchBrand && matchKw;
    card.style.display = show ? '' : 'none';
    if (show) anyVisible = true;
  });

  if (noResult) noResult.style.display = !anyVisible ? '' : 'none';
}

/* ── GPS 주변 목록 검색 필터 ── */
function filterNearbyList(kw) {
  const q=(kw||'').trim().toLowerCase();
  document.querySelectorAll('#nearbyList .nearby-cpn-item').forEach(item=>{
    const txt=(item.dataset.store||'')+item.textContent;
    const match = !q || txt.toLowerCase().includes(q);
    // display:none 대신 opacity+visibility로 처리 → 공간 유지, 레이아웃 밀림 없음
    item.style.visibility    = match ? '' : 'hidden';
    item.style.opacity       = match ? '1' : '0';
    item.style.pointerEvents = match ? '' : 'none';
    item.style.transition    = 'opacity .15s';
  });
}
function sortNearbyList(val) { /* prototype — UI only */ }

const NEARBY_SORT_LABELS=['만료임박순','거리순','인기순','최대할인'];
let _nearbySortIdx=0;
function cycleNearbySort(){
  _nearbySortIdx=(_nearbySortIdx+1)%NEARBY_SORT_LABELS.length;
  const lbl=document.getElementById('nmapSortLabel');
  if(lbl) lbl.textContent=NEARBY_SORT_LABELS[_nearbySortIdx];
}

/* ── 대한민국 행정구역 데이터 ── */
const KOREA_DISTRICTS = {
  '서울': ['전체','종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구','노원구','은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구','관악구','서초구','강남구','송파구','강동구'],
  '부산': ['전체','중구','서구','동구','영도구','부산진구','동래구','남구','북구','해운대구','사하구','금정구','강서구','연제구','수영구','사상구','기장군'],
  '대구': ['전체','중구','동구','서구','남구','북구','수성구','달서구','달성군','군위군'],
  '인천': ['전체','중구','동구','미추홀구','연수구','남동구','부평구','계양구','서구','강화군','옹진군'],
  '광주': ['전체','동구','서구','남구','북구','광산구'],
  '대전': ['전체','동구','중구','서구','유성구','대덕구'],
  '울산': ['전체','중구','남구','동구','북구','울주군'],
  '세종': ['전체','세종시'],
  '경기': ['전체','수원시','성남시','의정부시','안양시','부천시','광명시','평택시','동두천시','안산시','고양시','과천시','구리시','남양주시','오산시','시흥시','군포시','의왕시','하남시','용인시','파주시','이천시','안성시','김포시','화성시','광주시','양주시','포천시','여주시','연천군','가평군','양평군'],
  '강원': ['전체','춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시','홍천군','횡성군','영월군','평창군','정선군','철원군','화천군','양구군','인제군','고성군','양양군'],
  '충북': ['전체','청주시','충주시','제천시','보은군','옥천군','영동군','증평군','진천군','괴산군','음성군','단양군'],
  '충남': ['전체','천안시','공주시','보령시','아산시','서산시','논산시','계룡시','당진시','금산군','부여군','서천군','청양군','홍성군','예산군','태안군'],
  '전북': ['전체','전주시','군산시','익산시','정읍시','남원시','김제시','완주군','진안군','무주군','장수군','임실군','순창군','고창군','부안군'],
  '전남': ['전체','목포시','여수시','순천시','나주시','광양시','담양군','곡성군','구례군','고흥군','보성군','화순군','장흥군','강진군','해남군','영암군','무안군','함평군','영광군','장성군','완도군','진도군','신안군'],
  '경북': ['전체','포항시','경주시','김천시','안동시','구미시','영주시','영천시','상주시','문경시','경산시','군위군','의성군','청송군','영양군','영덕군','청도군','고령군','성주군','칠곡군','예천군','봉화군','울진군','울릉군'],
  '경남': ['전체','창원시','진주시','통영시','사천시','김해시','밀양시','거제시','양산시','의령군','함안군','창녕군','고성군','남해군','하동군','산청군','함양군','거창군','합천군'],
  '제주': ['전체','제주시','서귀포시']
};

function updateNearbyDistricts(city) {
  const sel = document.getElementById('nearbyDistrictSelect');
  if (!sel) return;
  const list = KOREA_DISTRICTS[city] || [];
  sel.innerHTML = list.length
    ? list.map(d => `<option>${d}</option>`).join('')
    : '<option>시/구/군 선택</option>';
}

/* ── Leaflet 지도 초기화 ── */
let nearbyMap=null;
let storeMarkers={};
let nearbyClusterMarkers=[];
let activeStoreKey=null;
let favMode=false;
let activeClusterStores=null;

/* NEARBY_STORES — USE_COUPONS 데이터 연동 */
function _makeStore(brandKey, storeName, lat, lng, dist, walk, addr, extraProps) {
  const cpn = USE_COUPONS.find(c => c.brand === brandKey);
  const dnum = cpn ? cpnDdayNum(cpn.expiry) : 999;
  return Object.assign({
    key: brandKey,
    name: storeName,
    lat, lng, dist, walk, addr,
    disc: cpn ? cpnBenefitLabel(cpn) + (cpn.discType==='정률'?' 할인':'') : '',
    couponTitle: cpn ? '[' + brandKey + '] ' + cpn.name : '',
    dday: cpn ? cpnDday(cpn.expiry) : '',
    urgent: dnum <= 7,
    date: cpn ? cpn.expiry : '',
    logo: cpnInitial(brandKey),
    color: cpnBgColor(brandKey),
    fav: cpn ? cpn.fav : false,
    pinType: 'coupon',
    cpnId: cpn ? cpn.id : null,
  }, extraProps || {});
}

const NEARBY_STORES = [
  _makeStore('이마트',   '이마트 영등포점',   37.5262, 126.8953, '300m',  '도보 4분',  '서울시 영등포구 영등포동 1가 62'),
  _makeStore('GS25',    'GS25 영등포역점',    37.5285, 126.8993, '520m',  '도보 7분',  '서울시 영등포구 영등포로 지하 1'),
  _makeStore('스타벅스', '스타벅스 영등포점',  37.5244, 126.8931, '850m',  '도보 11분', '서울시 영등포구 당산로 38'),
  /* 포인트 타입 매장 */
  { key:'할리스', name:'할리스 숙대입구점', lat:37.5258, lng:126.8977,
    disc:'적립 5%', pointRate:'적립 5%', point:'3,022P', expiringPoint:'1,000P', expiringDday:'D-7',
    dday:'', urgent:false, dist:'100m', walk:'도보 4분',
    addr:'서울시 용산구 청파동 34',
    logo:'H', color:'#B5121B', fav:false, pinType:'point' },
  { key:'GS25포인트', name:'GS25 포인트 영등포역점', lat:37.5274, lng:126.9000,
    disc:'포인트 적립', pointRate:'적립 3%', point:'1,500P', expiringPoint:'300P', expiringDday:'D-14',
    dday:'', urgent:false, dist:'560m', walk:'도보 8분',
    addr:'서울시 영등포구 영등포로 지하 1',
    logo:'G', logoImg:'로고/GS25 logo.svg', color:'var(--color-blue-500)', fav:false, pinType:'point' },
  { key:'스타벅스리워드', name:'스타벅스 리워드 영등포점', lat:37.5240, lng:126.8942,
    disc:'별 적립', pointRate:'별 적립', point:'8개', expiringPoint:'2개', expiringDday:'D-21',
    dday:'', urgent:false, dist:'880m', walk:'도보 12분',
    addr:'서울시 영등포구 당산로 38',
    logo:'S', color:'var(--color-blue-500)', fav:false, pinType:'point' },
  _makeStore('올리브영', '올리브영 영등포점',  37.5291, 126.9013, '1.1km', '도보 14분', '서울시 영등포구 국제금융로 10'),
  _makeStore('홈플러스', '홈플러스 영등포점',  37.5220, 126.8910, '1.4km', '도보 18분', '서울시 영등포구 영등포로 443'),
  _makeStore('배달의민족','배달의민족 온라인',  37.5270, 126.8975, '—',    '앱 주문',   '온라인 서비스'),
  _makeStore('CU',       'CU 영등포역점',      37.5278, 126.8988, '420m',  '도보 6분',  '서울시 영등포구 영등포로 지하 2'),
  _makeStore('메가커피',  '메가커피 영등포점',        37.5250, 126.8945, '650m',  '도보 8분',  '서울시 영등포구 영등포로 123'),
  _makeStore('BHC',      'BHC 영등포점',             37.5233, 126.8920, '1.0km', '도보 13분', '서울시 영등포구 당산로 45'),
  /* 오프라인/온오프라인 쿠폰 브랜드 추가 */
  _makeStore('투썸플레이스', '투썸플레이스 영등포역점',  37.5282, 126.8997, '480m',  '도보 6분',  '서울시 영등포구 영등포로 267'),
  _makeStore('투썸플레이스', '투썸플레이스 타임스퀘어점',37.5238, 126.8967, '920m',  '도보 12분', '서울시 영등포구 영중로 15'),
  _makeStore('나이키',   '나이키 타임스퀘어점',      37.5238, 126.8967, '920m',  '도보 12분', '서울시 영등포구 영중로 15 타임스퀘어 3F'),
  _makeStore('아디다스', '아디다스 타임스퀘어점',     37.5240, 126.8970, '900m',  '도보 12분', '서울시 영등포구 영중로 15 타임스퀘어 2F'),
  _makeStore('무신사',   '무신사 스탠다드 홍대점',    37.5550, 126.9220, '6.2km', '대중교통 20분', '서울시 마포구 어울마당로 35'),
  _makeStore('무신사',   '무신사 스탠다드 강남점',    37.5015, 127.0253, '8.1km', '대중교통 28분', '서울시 강남구 강남대로 538'),
  _makeStore('ZARA',     'ZARA 타임스퀘어점',        37.5238, 126.8968, '910m',  '도보 12분', '서울시 영등포구 영중로 15 타임스퀘어 4F'),
  _makeStore('ZARA',     'ZARA 영등포 롯데백화점점',  37.5198, 126.9060, '1.6km', '도보 20분', '서울시 영등포구 경인로 846'),
  _makeStore('CGV',      'CGV 영등포점',              37.5230, 126.9060, '1.5km', '도보 19분', '서울시 영등포구 경인로 846'),
  _makeStore('CGV',      'CGV 여의도점',              37.5214, 126.9243, '3.8km', '대중교통 15분', '서울시 영등포구 국제금융로 10'),
  _makeStore('롯데월드', '롯데월드 어드벤처 잠실점',  37.5111, 127.0986, '12.8km','대중교통 35분', '서울시 송파구 올림픽로 240'),
  _makeStore('교보문고', '교보문고 영등포점',         37.5240, 126.8967, '900m',  '도보 12분', '서울시 영등포구 영중로 15 타임스퀘어 B1'),
  _makeStore('교보문고', '교보문고 여의도점',         37.5218, 126.9240, '3.7km', '대중교통 14분', '서울시 영등포구 여의나루로 77'),
  _makeStore('알라딘',   '알라딘 중고서점 신촌점',   37.5576, 126.9365, '6.8km', '대중교통 22분', '서울시 서대문구 신촌로 83'),
  _makeStore('알라딘',   '알라딘 중고서점 홍대점',   37.5564, 126.9244, '6.5km', '대중교통 21분', '서울시 마포구 와우산로 21'),
];

const MAP_POINT_ICON_SIZE = [128, 114];
const MAP_POINT_ICON_ANCHOR = [64, 114];
const MAP_COUPON_ICON_SIZE = [128, 114];
const MAP_COUPON_ICON_ANCHOR = [64, 114];
const NEARBY_MAP_OVERVIEW_CENTER = [37.5270, 126.8960];
const NEARBY_MAP_DETAIL_CENTER = [37.5270, 126.8960];
const NEARBY_MAP_OVERVIEW_ZOOM = 11;
const NEARBY_MAP_DETAIL_ZOOM = 15;
const NEARBY_MAP_CLUSTER_MAX_ZOOM = 13;
const NEARBY_MAP_CLUSTER_POSITIONS = [
  [37.5328, 126.8908],
  [37.5308, 126.9026],
  [37.5198, 126.8998],
];
function isPointMapPinStore(store) {
  if (store.pinType) return store.pinType === 'point';
  return !!(store.point || store.pointRate || store.expiringPoint);
}
function getMapPinType(store) {
  return isPointMapPinStore(store) ? 'point' : 'coupon';
}
function getNearbyMapStores() {
  const offlineStores = NEARBY_STORES.filter(s => {
    const cpn = USE_COUPONS.find(c => c.id === s.cpnId);
    return !cpn || cpn.channel !== '온라인';
  });
  const couponStores = offlineStores.filter(s => getMapPinType(s) === 'coupon').slice(0, 6);
  const pointStores = offlineStores.filter(s => getMapPinType(s) === 'point').slice(0, 3);
  return couponStores.concat(pointStores);
}
function getMapPinBrandLabel(store) {
  if (!store) return '';
  return String(store.key || store.name || '').replace(/포인트|리워드/g, '').trim() || store.key || '';
}
function getMapPinBenefitLabel(store) {
  if (!store) return '';
  if (getMapPinType(store) === 'point') {
    if (store.pointRate) return store.pointRate + ' · ' + (store.point || '');
    if (store.point) return '포인트 ' + store.point;
    return '포인트 사용 가능';
  }
  const cpn = store.cpnId ? USE_COUPONS.find(c => c.id === store.cpnId) : USE_COUPONS.find(c => c.brand === store.key);
  if (cpn) return cpn.name;
  return (store.couponTitle || store.disc || '쿠폰 사용 가능').replace(/^\[[^\]]+\]\s*/, '');
}
function renderMapPinLabel(store) {
  return '<span class="map-benefit-label-title">' + getMapPinBenefitLabel(store) + '</span>';
}
const BRAND_LOGO = {
  '스타벅스':   '로고/starbucks.svg',
  'GS25':       '로고/GS25 logo.svg',
  'CU':         '로고/CU logo.svg',
  '올리브영':   '로고/사경디_로고_올리브영.svg',
  '배달의민족': '로고/사경디_로고_배달의민족.svg',
  '요기요':     '로고/사경디_로고_요기요-01.svg',
  '메가커피':   '로고/메가커피.svg',
  '파리바게뜨': '로고/Paris_Baguette.svg',
  '무신사':     '로고/무신사.svg',
  'BBQ':        '로고/BBQ logo.svg',
  'BHC':        '로고/BHC logo.svg',
  '도미노피자': '로고/도미노피자 logo.svg',
  '유니클로':   '로고/UNIQLO.svg',
  '자라':       '로고/Zara.svg',
};

function renderPointMapPin(state, store) {
  const logoSrc = store && BRAND_LOGO[store.key];
  const figmaLogoSrc = 'https://www.figma.com/api/mcp/asset/50fd025e-0ee8-4402-9d14-880b6cc79338';
  const innerContent = logoSrc
    ? '<img src="' + logoSrc + '" alt="' + (store ? store.key : '포인트') + '">'
    : '<img src="' + figmaLogoSrc + '" alt="포인트">';
  return (
    '<div class="map-dot-pin map-benefit-pin point' + (state ? ' ' + state : '') + '">' +
      '<div class="map-benefit-label">' + renderMapPinLabel(store) + '</div>' +
      '<div class="map-benefit-dot map-benefit-dot-point">' + innerContent + '</div>' +
    '</div>'
  );
}
function renderCouponMapPin(state, store) {
  const logoSrc = store && BRAND_LOGO[store.key];
  const logoContent = logoSrc
    ? '<img src="' + logoSrc + '" alt="' + (store ? store.key : '쿠폰') + '">'
    : '<span class="map-point-figma-letter">C</span>';
  return (
    '<div class="map-dot-pin map-benefit-pin coupon' + (state ? ' ' + state : '') + '">' +
      '<div class="map-benefit-label">' + renderMapPinLabel(store) + '</div>' +
      '<div class="map-benefit-dot map-benefit-dot-coupon">' + logoContent + '</div>' +
    '</div>'
  );
}
function renderMapPin(store, stateClass) {
  const state = stateClass || (favMode && store.fav ? 'fav' : (store.urgent ? 'urgent' : ''));
  return getMapPinType(store) === 'point' ? renderPointMapPin(state, store) : renderCouponMapPin(state, store);
}
function createMapPinIcon(store, stateClass) {
  const isPoint = getMapPinType(store) === 'point';
  return L.divIcon({
    html: renderMapPin(store, stateClass),
    iconSize: isPoint ? MAP_POINT_ICON_SIZE : MAP_COUPON_ICON_SIZE,
    iconAnchor: isPoint ? MAP_POINT_ICON_ANCHOR : MAP_COUPON_ICON_ANCHOR,
    className: ''
  });
}
function createMapClusterIcon(count) {
  return L.divIcon({
    html: '<div class="map-cluster-pin"><span>' + count + '</span></div>',
    iconSize: [54, 54],
    iconAnchor: [27, 27],
    className: ''
  });
}
function isStoreVisibleByMapFilter(store) {
  const pinType = getMapPinType(store);
  if (nmapActiveFilter === 'fav') return !!store.fav;
  if (nmapActiveFilter === 'coupon') return pinType === 'coupon';
  if (nmapActiveFilter === 'point') return pinType === 'point';
  return true;
}
function getFilteredMapStores() {
  const baseStores = activeClusterStores || Object.values(storeMarkers).map(({ store }) => store);
  return baseStores
    .filter(isStoreVisibleByMapFilter);
}
function getMapClusterLatLng(stores) {
  if (!stores.length) return NEARBY_MAP_DETAIL_CENTER;
  const sum = stores.reduce((acc, store) => {
    acc.lat += store.lat;
    acc.lng += store.lng;
    return acc;
  }, { lat: 0, lng: 0 });
  return [sum.lat / stores.length, sum.lng / stores.length];
}
function getOverviewClusterLatLng(index, stores) {
  return NEARBY_MAP_CLUSTER_POSITIONS[index] || getMapClusterLatLng(stores);
}
function getNearbyClusterGroups(stores) {
  const visibleStores = stores || [];
  const groupSizes = [3, 4, 2];
  const groups = [];
  let cursor = 0;
  groupSizes.forEach(size => {
    const groupStores = visibleStores.slice(cursor, cursor + size);
    cursor += size;
    if (groupStores.length) groups.push(groupStores);
  });
  if (cursor < visibleStores.length) {
    const overflow = visibleStores.slice(cursor);
    if (groups.length) groups[groups.length - 1] = groups[groups.length - 1].concat(overflow);
    else groups.push(overflow);
  }
  return groups;
}
function setMapMarkerVisibility(marker, visible) {
  marker.setOpacity(visible ? 1 : 0);
  const mapEl = marker.getElement();
  if (mapEl) mapEl.style.pointerEvents = visible ? '' : 'none';
}
function expandNearbyCluster(stores) {
  if (!nearbyMap) return;
  activeClusterStores = stores && stores.length ? stores : null;
  const target = activeClusterStores ? getMapClusterLatLng(activeClusterStores) : NEARBY_MAP_DETAIL_CENTER;
  nearbyMap.setView(target, NEARBY_MAP_DETAIL_ZOOM, { animate: true });
  setTimeout(applyNearbyMapZoomMode, 350);
}
function centerNearbyMapOnUser() {
  if (!nearbyMap) return;
  // activeClusterStores는 유지 — 클러스터 진입 상태에서 핀 범위 그대로
  closeNearbySheet();
  nearbyMap.setView(NEARBY_MAP_DETAIL_CENTER, NEARBY_MAP_DETAIL_ZOOM, { animate: true });
  setTimeout(() => {
    applyNearbyMapZoomMode();
    nearbyMap.panTo(NEARBY_MAP_DETAIL_CENTER, { animate: true });
  }, 120);
}
function syncNearbyClusterMarker() {
  if (!nearbyMap || !window.L) return;
  const stores = getFilteredMapStores();
  if (!stores.length) {
    nearbyClusterMarkers.forEach(marker => marker.remove());
    nearbyClusterMarkers = [];
    return;
  }
  const groups = getNearbyClusterGroups(stores);
  while (nearbyClusterMarkers.length > groups.length) {
    const marker = nearbyClusterMarkers.pop();
    if (marker) marker.remove();
  }
  groups.forEach((groupStores, index) => {
    const latLng = getOverviewClusterLatLng(index, groupStores);
    if (!nearbyClusterMarkers[index]) {
      const marker = L.marker(latLng, {
        icon: createMapClusterIcon(groupStores.length),
        zIndexOffset: 800 + index
      }).addTo(nearbyMap);
      marker.on('click', e => {
        L.DomEvent.stopPropagation(e);
        expandNearbyCluster(marker._clusterStores || groupStores);
      });
      nearbyClusterMarkers[index] = marker;
    }
    nearbyClusterMarkers[index]._clusterStores = groupStores;
    nearbyClusterMarkers[index].setLatLng(latLng);
    nearbyClusterMarkers[index].setIcon(createMapClusterIcon(groupStores.length));
  });
}
function applyNearbyMapZoomMode() {
  if (!nearbyMap) return;
  const showCluster = nearbyMap.getZoom() <= NEARBY_MAP_CLUSTER_MAX_ZOOM;
  if (showCluster) activeClusterStores = null;
  syncNearbyClusterMarker();
  const activeClusterKeys = activeClusterStores ? new Set(activeClusterStores.map(store => store.key)) : null;
  Object.values(storeMarkers).forEach(({ marker, store }) => {
    const visible = !showCluster && isStoreVisibleByMapFilter(store) && (!activeClusterKeys || activeClusterKeys.has(store.key));
    setMapMarkerVisibility(marker, visible);
    if (visible) marker.setIcon(createMapPinIcon(store));
  });
  const hasFilteredStores = getFilteredMapStores().length > 0;
  nearbyClusterMarkers.forEach(marker => {
    setMapMarkerVisibility(marker, showCluster && hasFilteredStores);
  });
  if (showCluster) closeNearbySheet();
  /* 레이어 버튼: 클러스터 뷰에서는 숨김, 줌인 상태에서만 표시 */
  const layerBtn = document.getElementById('nmapBtnLayer');
  if (layerBtn) layerBtn.style.display = showCluster ? 'none' : 'flex';
}

function openNearbyListSheet() {
  // 실제로 지도에 표시된(opacity=1) 마커의 store만 포함
  const stores = Object.values(storeMarkers)
    .filter(({ marker }) => (marker.options.opacity ?? 1) > 0)
    .map(({ store }) => store)
    .filter(isStoreVisibleByMapFilter);
  const body = document.getElementById('nmapListBody');
  if (!body) return;

  if (!stores.length) {
    body.innerHTML = `<p style="text-align:center;padding:var(--spacing-32) 0;font-size:var(--font-size-body);color:var(--color-gray-400);font-family:var(--font);">주변에 혜택이 없습니다</p>`;
  } else {
    body.innerHTML = stores.map(store => {
      const logoSrc = (typeof BRAND_LOGO !== 'undefined') ? (BRAND_LOGO[store.key] || BRAND_LOGO[store.name] || '') : '';
      const logoHtml = logoSrc
        ? `<img src="${logoSrc}" alt="${store.key || store.name}">`
        : `<span style="font-size:var(--font-size-headline-sm);font-weight:var(--font-weight-bold);font-family:var(--font);color:var(--color-surface);background:var(--color-gray-400);display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${(store.key||store.name||'?').charAt(0)}</span>`;
      const expiry = store.expiry || store.expiryDate || store.expiresAt || '';
      const expiryFmt = expiry ? expiry.replace(/-/g, '.') : '2026.00.00';
      const title = store.couponTitle || store.title || store.benefitTitle || store.key || '';
      const storeName = store.name || store.storeName || store.key || '';
      return `
        <div class="nmap-list-item">
          <div class="nmap-list-logo">${logoHtml}</div>
          <div class="nmap-list-info">
            <p class="nmap-list-store">${storeName}</p>
            <p class="nmap-list-title">${title}</p>
            <div class="nmap-list-meta">
              <span class="nmap-list-date">${expiryFmt}</span>
              <span class="nmap-list-dist">
                <svg width="17" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-700)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${store.dist || '100m'}
              </span>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  document.getElementById('nmapListOverlay').classList.add('open');
  document.getElementById('nmapListSheet').classList.add('open');
}

function closeNearbyListSheet() {
  const overlay = document.getElementById('nmapListOverlay');
  const sheet   = document.getElementById('nmapListSheet');
  if (overlay) overlay.classList.remove('open');
  if (sheet)   sheet.classList.remove('open');
}

function toggleNearbyListView() {
  const sheet = document.getElementById('nmapListSheet');
  if (sheet && sheet.classList.contains('open')) {
    closeNearbyListSheet();
  } else {
    openNearbyListSheet();
  }
}

function initNearbyMap() {
  if (!window.L) return;
  const el=document.getElementById('nearbyMap');
  if (!el) return;
  if (nearbyMap) {
    closeNearbySheet();
    activeClusterStores = null;
    nearbyMap.setView(NEARBY_MAP_OVERVIEW_CENTER, NEARBY_MAP_OVERVIEW_ZOOM);
    applyNearbyMapZoomMode();
    setTimeout(()=>nearbyMap.invalidateSize(),100);
    return;
  }
  el.innerHTML='';
  nearbyMap = L.map('nearbyMap',{zoomControl:false}).setView(NEARBY_MAP_OVERVIEW_CENTER, NEARBY_MAP_OVERVIEW_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',maxZoom:19
  }).addTo(nearbyMap);

  /* 현재 위치 마커 — 파란 물방울 */
  const userIcon=L.divIcon({
    html:`<div class="map-user-pin"><div class="map-user-pin-inner"><div class="map-user-pin-dot"></div></div></div>`,
    iconSize:[32,32], iconAnchor:[16,16], className:''
  });
  L.marker(NEARBY_MAP_DETAIL_CENTER,{icon:userIcon, zIndexOffset:1000}).addTo(nearbyMap);

  /* 지도 배경 클릭 시 시트 닫기 */
  nearbyMap.on('click', ()=>closeNearbySheet());
  nearbyMap.on('zoomend', applyNearbyMapZoomMode);

  /* 상점 dot 마커 — 온라인 전용 쿠폰 제외 */
  storeMarkers={};
  getNearbyMapStores().forEach(s=>{
    const dotIcon=createMapPinIcon(s);
    const marker=L.marker([s.lat,s.lng],{icon:dotIcon}).addTo(nearbyMap);
    marker.on('click', e=>{
      L.DomEvent.stopPropagation(e);
      activateStorePin(s.key);
      openNearbySheet(s);
    });
    storeMarkers[s.key]={marker, store:s, active:false};
  });
  applyNearbyMapZoomMode();
  setTimeout(()=>nearbyMap.invalidateSize(),200);
}

function activateStorePin(key) {
  /* 이전 활성 핀 dot으로 복원 */
  if (activeStoreKey && storeMarkers[activeStoreKey]) {
    const prev=storeMarkers[activeStoreKey];
    prev.marker.setIcon(createMapPinIcon(prev.store));
  }
  /* 새 핀: Figma 지도 아이콘 selected 상태 */
  const cur=storeMarkers[key];
  if (!cur) return;
  const isPoint = getMapPinType(cur.store) === 'point';
  cur.marker.setIcon(L.divIcon({
    html: renderMapPin(cur.store, 'selected'),
    iconSize: isPoint ? MAP_POINT_ICON_SIZE : MAP_COUPON_ICON_SIZE,
    iconAnchor: isPoint ? MAP_POINT_ICON_ANCHOR : MAP_COUPON_ICON_ANCHOR,
    className:''
  }));
  nearbyMap.panTo(cur.marker.getLatLng(), {animate:true, duration:0.4});
  activeStoreKey=key;
}

function showOnlyActiveNearbyPin(key) {
  Object.values(storeMarkers).forEach(({ marker, store }) => {
    const visible = store.key === key;
    setMapMarkerVisibility(marker, visible);
    if (visible) marker.setIcon(createMapPinIcon(store, 'selected'));
  });
  nearbyClusterMarkers.forEach(marker => setMapMarkerVisibility(marker, false));
}

function restoreNearbyPinsAfterSheet() {
  if (!nearbyMap) return;
  applyNearbyMapZoomMode();
}

/* ── 지도 바텀시트 상태 관리 ── */
let nbsExpanded = false;
let nbsStoreKey = null;

function openNearbySheet(s) {
  const sheet = document.getElementById('nearbySheet');
  if (!sheet) return;
  if (sheet.classList.contains('open') && nbsStoreKey === s.key) {
    collapseNbs();
    return;
  }
  nbsExpanded = false;
  nbsStoreKey = s.key;
  const cardType = getMapPinType(s);

  sheet.className = `nearby-sheet open nbs-collapsed nbs-${cardType}`;
  sheet.innerHTML = cardType === 'coupon' ? renderNbsPointCard(s) : renderNbsCouponCard(s);

  document.getElementById('nearbySheetBg')?.classList.add('show');
  showOnlyActiveNearbyPin(s.key);

  // 스와이프 제스처 초기화
  initNbsSwipe(sheet);
}

function nbsHeartButton(s) {
  return `<button class="nbs-heart-btn${s.fav?' on':''}" id="nbsHeartBtn" aria-label="찜" onclick="event.stopPropagation();nbsToggleHeart(this,'${s.key}')">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="${s.fav?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  </button>`;
}

function nbsMapIcon(size=24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
}

function nbsLinkIcon() {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>`;
}

function nbsSharePlaceholders(s) {
  return `<div class="nbs-share-icons">
    <button class="nbs-share-icon" onclick="event.stopPropagation();nbsShare('kakao','${s.key}')" aria-label="카카오톡 공유"></button>
    <button class="nbs-share-icon" onclick="event.stopPropagation();nbsShare('naver','${s.key}')" aria-label="네이버 공유"></button>
    <button class="nbs-share-icon" onclick="event.stopPropagation();nbsShare('sms','${s.key}')" aria-label="문자 공유"></button>
  </div>`;
}

function nbsUseButton(s) {
  return `<div class="nbs-action-area">
      <button class="nbs-use-btn" onclick="event.stopPropagation();nbsUse('${s.key}')">사용하기</button>
    </div>`;
}

function renderNbsPointCard(s) {
  const couponTitle = (s.couponTitle || s.disc || '').replace(/^\[[^\]]+\]\s*/, '');
  const expiryDate = (s.date?.replace(/ ~ .*/, '') || '2026.05.31').replaceAll('-', '.');
  return `
    <div class="nearby-sheet-handle" id="nbsHandle"></div>
    <div class="nbs-scroll" id="nbsScroll">
      <div class="nbs-top-row">
        <span class="nbs-dday${s.urgent?' urgent':''}">${s.dday}</span>
        ${nbsHeartButton(s)}
      </div>
      <div class="nbs-info-row">
        <div class="nbs-logo" style="background:${s.color||'var(--color-primary)'}">${s.logo}</div>
        <div class="nbs-info-col">
          <p class="nbs-store-name">${s.name}</p>
          <p class="nbs-coupon-title">${couponTitle}</p>
          <div class="nbs-meta-row">
            <span class="nbs-date">${expiryDate}</span>
            <span class="nbs-dist-badge">${nbsMapIcon(16)} ${s.dist}</span>
          </div>
        </div>
      </div>
      <hr class="nbs-divider">
      <div id="nbsExpandedArea" style="display:none">
        <div class="nbs-location-row">
          <div class="nbs-row-icon">${nbsMapIcon()}</div>
          <div class="nbs-location-info">
            <p class="nbs-addr">${s.addr||s.name}</p>
            <div class="nbs-walk-row">
              <span class="nbs-dist-badge">${s.dist}</span>
              <span class="nbs-walk-text">${s.walk||'도보 4분'}</span>
            </div>
          </div>
        </div>
        <hr class="nbs-divider">
        <div class="nbs-share-row" onclick="event.stopPropagation();nbsShare('kakao','${s.key}')">
          <div class="nbs-row-icon">${nbsLinkIcon()}</div>
          <div class="nbs-location-info">
            <p class="nbs-share-text">공유하기</p>
          </div>
        </div>
        <hr class="nbs-divider">
      </div>
      ${nbsUseButton(s)}
    </div>
  `;
}

function renderNbsCouponCard(s) {
  const point    = s.point        || '3,022P';
  const expiring = s.expiringPoint || '1,000P';
  const dday     = s.expiringDday  || 'D-7';
  // "D-7" → "7일 내 소멸 예정" 변환
  const ddayNum  = dday.replace('D-', '');
  const expiryLabel = ddayNum && !isNaN(ddayNum) ? `${ddayNum}일 내 소멸 예정` : '소멸 예정';
  const logoHtml = s.logoImg
    ? `<img src="${s.logoImg}" alt="${s.key}">`
    : `${s.logo}`;

  return `
    <div class="nearby-sheet-handle" id="nbsHandle"></div>
    <div class="nbs-scroll" id="nbsScroll">

      <!-- 1. 거리 뱃지 + 하트 row -->
      <div class="nbs-dist-heart-row">
        <span class="nbs-dist-badge">${nbsMapIcon(14)} ${s.dist}</span>
        <button class="nbs-panel-heart${s.fav?' on':''}" aria-label="찜"
          onclick="event.stopPropagation();nbsToggleHeart(this,'${s.key}')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${s.fav?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>

      <!-- 2. 로고 + 정보 컬럼 -->
      <div class="nbs-pt-main-row">
        <div class="nbs-logo${s.logoImg ? ' nbs-logo-img' : ''}" style="background:${s.logoImg ? 'transparent' : (s.color||'var(--color-primary)')}">${logoHtml}</div>
        <div class="nbs-pt-info-col">
          <p class="nbs-pt-store-name">${s.name}</p>
          <div class="nbs-pt-data-row">
            <!-- 잔여 포인트 -->
            <div class="nbs-pt-col">
              <div class="nbs-pt-col-label">
                <span class="nbs-pt-p-icon">P</span>
                잔여 포인트
              </div>
              <div class="nbs-pt-col-value">${point}</div>
            </div>
            <!-- 세로 구분선 -->
            <div class="nbs-pt-vdivider"></div>
            <!-- 소멸 예정 포인트 -->
            <div class="nbs-pt-col">
              <div class="nbs-pt-col-label">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--color-blue-500)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7.75 3.55V7.75L10.55 9.15M14.75 7.75C14.75 11.616 11.616 14.75 7.75 14.75C3.884 14.75 0.75 11.616 0.75 7.75C0.75 3.884 3.884 0.75 7.75 0.75C11.616 0.75 14.75 3.884 14.75 7.75Z"/>
                </svg>
                ${expiryLabel}
              </div>
              <div class="nbs-pt-col-value">${expiring}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 구분선 -->
      <hr class="nbs-divider">

      <!-- 확장 영역 (위로 밀면 표시) -->
      <div id="nbsExpandedArea" class="nbs-point-expanded-area" style="display:none">
        <!-- 위치 row -->
        <div class="nbs-location-row">
          <div class="nbs-row-icon">${nbsMapIcon()}</div>
          <div class="nbs-location-info">
            <p class="nbs-addr">${s.addr||s.name}</p>
            <div class="nbs-walk-row">
              <span class="nbs-dist-badge">${s.dist}</span>
              <span class="nbs-walk-text">${s.walk||'도보 4분'}</span>
            </div>
          </div>
        </div>
        <hr class="nbs-divider">
        <!-- 공유하기 row -->
        <div class="nbs-share-row" onclick="event.stopPropagation();nbsShare('kakao','${s.key}')">
          <div class="nbs-row-icon">${nbsLinkIcon()}</div>
          <div class="nbs-location-info">
            <p class="nbs-share-text">공유하기</p>
          </div>
        </div>
        <hr class="nbs-divider">
      </div>

      <!-- 4. 사용하기 버튼 -->
      ${nbsUseButton(s)}
    </div>
  `;
}

function nbsToggleHeart(btn, key) {
  const isOn = btn.classList.toggle('on');
  const svg = btn.querySelector('svg');
  if (svg) svg.setAttribute('fill', isOn ? 'currentColor' : 'none');
  const store = NEARBY_STORES.find(s => s.key === key);
  if (store) store.fav = isOn;
}

function nbsShare(platform, key) {
  // 기존 공유 바텀시트 재사용 (z-index 2410 — 탭바·nearbySheet보다 위)
  openPdetShare();
}

function nbsUse(key) {
  const store = NEARBY_STORES.find(s => s.key === key);
  const detailIdMap = {
    '이마트':'emart',
    'GS25':'gs25',
    '스타벅스':'starbucks',
    '올리브영':'oliveyoung',
    '홈플러스':'homeplus',
    '할리스':'hollys'
  };
  const detailId = store?.detailId || detailIdMap[key] || key.toLowerCase();
  if (store) { ACT['go-detail']?.({target:{dataset:{id: detailId}}}); }
  closeNearbySheet();
}

/* 스와이프 업/다운 제스처 */
function initNbsSwipe(sheet) {
  let startY = 0, startScrollTop = 0, dragging = false;
  const handle = sheet.querySelector('#nbsHandle');
  const scroll = sheet.querySelector('#nbsScroll');

  function onStart(clientY) {
    startY = clientY;
    startScrollTop = scroll ? scroll.scrollTop : 0;
    dragging = true;
  }
  function onMove(clientY) {
    if (!dragging) return;
    const dy = startY - clientY; // 위로 이동 = 양수
    if (dy > 40 && !nbsExpanded) expandNbs();
    else if (dy < -40 && nbsExpanded && startScrollTop <= 0) collapseNbs();
  }
  function onEnd() { dragging = false; }

  if (handle) {
    handle.addEventListener('touchstart', e => onStart(e.touches[0].clientY), {passive:true});
    handle.addEventListener('touchmove',  e => onMove(e.touches[0].clientY), {passive:true});
    handle.addEventListener('touchend',   onEnd);
    handle.addEventListener('mousedown',  e => onStart(e.clientY));
    window.addEventListener('mousemove',  e => { if(dragging) onMove(e.clientY); });
    window.addEventListener('mouseup',    onEnd);
  }
  if (scroll) {
    scroll.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      expandNbs();
    });
    scroll.addEventListener('touchstart', e => { startY = e.touches[0].clientY; startScrollTop = scroll.scrollTop; }, {passive:true});
    scroll.addEventListener('touchmove',  e => {
      const dy = startY - e.touches[0].clientY;
      if (!nbsExpanded && dy > 30) { expandNbs(); return; }
      if (nbsExpanded && dy < -30 && scroll.scrollTop <= 0) collapseNbs();
    }, {passive:true});
  }
}

function expandNbs() {
  if (nbsExpanded) return;
  nbsExpanded = true;
  const sheet = document.getElementById('nearbySheet');
  if (sheet) {
    sheet.classList.remove('nbs-collapsed');
    sheet.classList.add('nbs-expanded');
  }
  const area = document.getElementById('nbsExpandedArea');
  if (area) {
    // point 타입은 flex column, 쿠폰 타입은 block
    const sheet = document.getElementById('nearbySheet');
    area.style.display = 'block';
    area.style.animation = 'fadeIn .2s ease';
  }
}

function collapseNbs() {
  if (!nbsExpanded) return;
  nbsExpanded = false;
  const sheet = document.getElementById('nearbySheet');
  if (sheet) {
    sheet.classList.remove('nbs-expanded');
    sheet.classList.add('nbs-collapsed');
  }
  const area = document.getElementById('nbsExpandedArea');
  if (area) area.style.display = 'none';
}

/* 브랜드별 샘플 쿠폰 데이터 */
/* ── 브랜드별 알림 데이터 (시간 그룹 포맷) ── */
const BRAND_COUPONS = {
  emart: [
    { group:'오늘',     time:'3시간 전',  ch:'오프라인',    title:'e머니 5천점 적립 쿠폰',      cond:'7만원 이상 결제 및 포인트 적립 시',  date:'2026.05.01 ~ 2026.08.31' },
    { group:'오늘',     time:'3시간 전',  ch:'오프라인',    title:'연세우유 크림빵 500원 할인',  cond:'연세우유 디저트 시리즈 전체',        date:'2026.05.01 ~ 2026.11.30' },
    { group:'어제',     time:'20시간 전', ch:'온라인',      title:'마트 직송 8천원 할인쿠폰',    cond:'8만원 이상 주문 시 사용 가능',       date:'2026.05.01 ~ 2026.07.31' },
    { group:'지난 7일', time:'1주일 전',  ch:'오프라인',    title:'모바일 금액권 5천원권',        cond:'타 결제 수단과 복합결제 가능',       date:'2026.04.25 ~ 2026.06.30' },
    { group:'지난 7일', time:'1주일 전',  ch:'오프라인',    title:'모바일 금액상품권 1만원권',    cond:'서비스 품목(담배/택배 등) 제외',     date:'2026.04.25 ~ 2027.05.19' },
  ],
  lottemart: [
    { group:'오늘',     time:'2시간 전',  ch:'오프라인',    title:'신선식품 25% 할인',           cond:'2만원 이상 구매 시',                date:'2026.05.01 ~ 2026.05.27' },
    { group:'어제',     time:'어제',      ch:'오프라인',    title:'생활용품 3천원 할인',          cond:'3만원 이상 구매 시',                date:'2026.05.01 ~ 2026.06.30' },
    { group:'지난 7일', time:'5일 전',    ch:'온오프라인',  title:'L.POINT 추가 적립',            cond:'행사 상품 구매 시',                 date:'2026.04.25 ~ 2026.08.31' },
  ],
  homeplus: [
    { group:'오늘',     time:'3시간 전',  ch:'오프라인',    title:'모바일 금액상품권 1만원권',    cond:'서비스 품목(담배/택배 등) 제외',     date:'2026.05.01 ~ 2027.05.19' },
    { group:'오늘',     time:'3시간 전',  ch:'온라인',      title:'쓱배송 10% 점포할인 쿠폰',     cond:'쓱배송 및 새벽배송 상품 적용',       date:'2026.05.01 ~ 2026.09.30' },
    { group:'어제',     time:'20시간 전', ch:'오프라인',    title:'수입맥주 골라담기 2천원권',    cond:'수입맥주 4캔 이상 구매 시',          date:'2026.04.28 ~ 2026.12.31' },
    { group:'지난 7일', time:'1주일 전',  ch:'오프라인',    title:'e머니 5천점 적립 쿠폰',        cond:'7만원 이상 결제 및 포인트 적립 시',  date:'2026.04.25 ~ 2026.08.31' },
  ],
  gs25: [
    { group:'오늘',     time:'3시간 전',  ch:'오프라인',    title:'연세우유 크림빵 500원 할인',   cond:'연세우유 디저트 시리즈 전체',        date:'2026.05.01 ~ 2026.11.30' },
    { group:'어제',     time:'20시간 전', ch:'오프라인',    title:'모바일 금액권 5천원권',         cond:'타 결제 수단과 복합결제 가능',       date:'2026.04.30 ~ 2026.06.30' },
  ],
  starbucks: [
    { group:'오늘',     time:'3시간 전',  ch:'오프라인',    title:'아메리카노 교환권',             cond:'없음',                               date:'2026.05.01 ~ 2026.06.30' },
    { group:'오늘',     time:'3시간 전',  ch:'오프라인',    title:'조각케이크+커피 세트권',        cond:'지정 세트 메뉴 변경 불가',           date:'2026.05.01 ~ 2027.05.19' },
    { group:'지난 7일', time:'1주일 전',  ch:'온라인',      title:'사이렌오더 1천원 할인',          cond:'5,000원 이상 결제 시',               date:'2026.04.25 ~ 2026.09.30' },
  ],
  baemin: [
    { group:'오늘',     time:'3시간 전',  ch:'온라인',      title:'가게배달 중복 15% 쿠폰',        cond:'해당 쿠폰 마크 부착 매장 주문 시',   date:'2026.05.01 ~ 2026.06.30' },
    { group:'어제',     time:'20시간 전', ch:'온라인',      title:'사이드메뉴 무료증정 쿠폰',      cond:'치킨 메인 메뉴 1마리 이상 주문 시',  date:'2026.04.30 ~ 2027.05.19' },
  ],
  oliveyoung: [
    { group:'오늘',     time:'3시간 전',  ch:'온오프라인',  title:'기프트카드 5만원 충전권',       cond:'없음',                               date:'2026.05.01 ~ 2026.09.30' },
    { group:'오늘',     time:'3시간 전',  ch:'온라인',      title:'스킨케어 기획전 10% 쿠폰',      cond:'지정 스킨케어 브랜드 구매 시',       date:'2026.05.01 ~ 2026.12.31' },
    { group:'지난 7일', time:'1주일 전',  ch:'온오프라인',  title:'건강기능식품 5천원 할인권',     cond:'비타민 및 유산균 3만원 이상 시',     date:'2026.04.25 ~ 2026.05.31' },
  ],
  cu: [
    { group:'오늘',     time:'3시간 전',  ch:'오프라인',    title:'수입맥주 골라담기 2천원권',     cond:'수입맥주 4캔 이상 구매 시',           date:'2026.05.01 ~ 2026.12.31' },
    { group:'지난 7일', time:'1주일 전',  ch:'오프라인',    title:'e머니 5천점 적립 쿠폰',         cond:'7만원 이상 결제 및 포인트 적립 시',   date:'2026.04.25 ~ 2026.08.31' },
  ],
  yogiyo: [
    { group:'어제',     time:'20시간 전', ch:'온라인',      title:'배달 전용 무료배송 티켓',        cond:'배달 서비스 이용 시 배달비 면제',     date:'2026.04.30 ~ 2026.08.31' },
  ],
};

function renderNotiBrandLogo(brandKey, logoText) {
  const logoMap = {
    emart: '<span class="np-brand-mark">e</span><span class="np-brand-submark">마트</span>',
    lottemart: '<span class="np-brand-mark">롯</span><span class="np-brand-submark">마트</span>',
    homeplus: '<span class="np-brand-mark">홈</span><span class="np-brand-submark">플러스</span>',
    gs25: '<span class="np-brand-mark">GS</span><span class="np-brand-submark">25</span>',
    starbucks: '<span class="np-brand-mark">S</span><span class="np-brand-submark">BUCKS</span>',
    baemin: '<span class="np-brand-mark">배</span><span class="np-brand-submark">민</span>',
    oliveyoung: '<span class="np-brand-mark">O</span><span class="np-brand-submark">YOUNG</span>',
    cu: '<span class="np-brand-mark">CU</span>',
    yogiyo: '<span class="np-brand-mark">요</span><span class="np-brand-submark">기요</span>',
  };
  return logoMap[brandKey] || '<span class="np-brand-mark">' + String(logoText || '').charAt(0) + '</span>';
}

function formatNotiGroupLabel(coupon) {
  return coupon.group || coupon.time || '최근 알림';
}

function openNotiCouponDetail(brandKey) {
  if (ACT['go-detail']) ACT['go-detail']({target:{dataset:{id:brandKey}}});
}

function handleNotiBrandCardTap(event, groupId, cpnId) {
  if (event) event.stopPropagation();
  const group = document.getElementById(groupId);
  if (group && group.dataset.count !== '1') {
    if (!group.classList.contains('expanded')) {
      group.classList.add('expanded');
      return;
    }
    // 펼쳐져 있을 때: 카드 헤더 영역(브랜드명/하트)을 클릭하면 접히고, 바디 영역을 클릭하면 쿠폰 상세페이지로 이동
    const isHeaderClick = event && (event.target.closest('.nb-card-head') || event.target.classList.contains('nb-card-head'));
    if (isHeaderClick) {
      group.classList.remove('expanded');
      return;
    }
  }
  openNotiCouponDetail(cpnId);
}

/* ── 브랜드 알림 상세 페이지 열기 ── */
function openNotiBrand(brandKey, brandName, brandTone, logoText, badge) {
  const titleEl = document.getElementById('nbHeaderTitle');
  const nameEl = document.getElementById('nbBrandName');
  const subEl = document.getElementById('nbBrandSub');
  const circleEl = document.getElementById('nbBrandCircle');
  if (titleEl)  titleEl.textContent  = brandName;
  if (nameEl) nameEl.textContent = brandName;
  if (subEl) subEl.textContent = (badge || 0) + '개의 알림이 날짜별로 모여 있어요';
  if (circleEl) {
    circleEl.className = 'nb-brand-circle np-brand-logo ' + (brandTone || brandKey);
    circleEl.innerHTML = renderNotiBrandLogo(brandKey, logoText);
  }

  // 날짜 그룹별로 묶기
  const coupons = BRAND_COUPONS[brandKey] || [];
  const groupMap = {};
  const groupOrder = [];
  coupons.forEach(c => {
    const groupLabel = formatNotiGroupLabel(c);
    if (!groupMap[groupLabel]) { groupMap[groupLabel] = []; groupOrder.push(groupLabel); }
    groupMap[groupLabel].push(c);
  });

  // HTML 렌더링
  const groups = document.getElementById('nbCouponGroups');
  if (!groups) return;
  groups.innerHTML = groupOrder.map((groupLabel, groupIndex) => {
    const items = groupMap[groupLabel];
    const groupId = 'nbGroup' + groupIndex + '-' + brandKey;

    const cardsHtml = items.map(c => {
      const chLabel = c.ch || '온라인';
      const heartSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>';
      const matchedCpn = USE_COUPONS.find(uc => uc.name === c.title) || USE_COUPONS.find(uc => uc.brand === brandName);
      const cpnId = matchedCpn ? matchedCpn.id : brandKey;
      return (
        '<div class="nb-card" onclick="handleNotiBrandCardTap(event,\'' + groupId + '\',\'' + cpnId + '\')">' +
          /* 상단 행: 브랜드명 + 하트 */
          '<div class="nb-card-head">' +
            '<span class="nb-card-brand">' + brandName + '</span>' +
            '<span class="nb-card-fav">' + heartSvg + '</span>' +
          '</div>' +
          /* 하단 행: 로고 그리드 + 채널뱃지 + 정보 */
          '<div class="nb-card-body">' +
            '<div class="nb-card-logo-wrap">' +
              '<div class="nb-card-img np-brand-logo ' + (brandTone || brandKey) + '">' + renderNotiBrandLogo(brandKey, logoText) + '</div>' +
              '<span class="nb-ch-badge">' + chLabel + '</span>' +
            '</div>' +
            '<div class="nb-card-info">' +
              '<div class="nb-card-title">' + c.title + '</div>' +
              (c.cond && c.cond !== '없음' ? '<div class="nb-card-cond">' + c.cond + '</div>' : '') +
              '<div class="nb-card-date">' + c.date + '</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="nb-group">' +
        '<div class="nb-group-time" style="cursor: pointer;" onclick="toggleNbGroup(\'' + groupId + '\')">' + groupLabel + '</div>' +
        '<div class="nb-group-cards" id="' + groupId + '" data-count="' + items.length + '" onclick="toggleNbGroup(\'' + groupId + '\')">' + cardsHtml + '</div>' +
      '</div>'
    );
  }).join('');

  const scroll = document.getElementById('nbScrollArea');
  if (scroll) scroll.scrollTop = 0;
  showAppPage('noti-brand');
  const page = document.getElementById('p-noti-brand');
  if (page) page.scrollTop = 0;
  requestAnimationFrame(() => {
    const pageNow = document.getElementById('p-noti-brand');
    const scrollNow = document.getElementById('nbScrollArea');
    if (pageNow) pageNow.scrollTop = 0;
    if (scrollNow) scrollNow.scrollTop = 0;
  });
  updateSidebar('');
}

/* 그룹 펼치기/접기 */
function toggleNbGroup(groupId) {
  const el = document.getElementById(groupId);
  if (el) el.classList.toggle('expanded');
}

/* npbFilterChip removed — UI simplified */
function switchNotiTab(tab) {
  document.getElementById('np-brand').style.display    = tab === 'brand'    ? 'flex' : 'none';
  document.getElementById('np-deadline').style.display = tab === 'deadline' ? 'flex' : 'none';
  document.getElementById('npTabBrand').classList.toggle('on', tab === 'brand');
  document.getElementById('npTabDeadline').classList.toggle('on', tab === 'deadline');
}
/* ── 정렬 바텀시트 ── */
function togglePhSort(btnId, ddId, overlayId) {
  const dd = document.getElementById(ddId);
  const overlay = document.getElementById(overlayId);
  const btn = document.getElementById(btnId);
  if (!dd || !overlay) return;

  const isOpen = dd.classList.contains('open');
  if (isOpen) {
    closePhSortSheet(btnId, ddId, overlayId);
  } else {
    // 다른 모든 정렬 바텀시트 닫기
    document.querySelectorAll('.ph-sort-dd-panel').forEach(p => p.classList.remove('open'));
    document.querySelectorAll('.ph-sort-sheet-overlay').forEach(o => o.classList.remove('open'));
    document.querySelectorAll('.ph-sort-btn').forEach(b => {
      b.textContent = b.textContent.replace('⌃', '▾');
    });

    dd.classList.add('open');
    overlay.classList.add('open');
    if (btn) btn.textContent = btn.textContent.replace('▾', '⌃');
  }
}
function selectPhSort(el, btnId, ddId, overlayId) {
  const dd = document.getElementById(ddId);
  const btn = document.getElementById(btnId);
  if (!dd) return;

  // 모든 아이템 선택 해제 및 체크 마크 지우기
  dd.querySelectorAll('.ph-sort-dd-item').forEach(item => {
    item.classList.remove('sel');
    const chk = item.querySelector('.ph-sort-dd-check');
    if (chk) chk.textContent = '';
  });

  // 선택된 아이템 처리
  el.classList.add('sel');
  const activeChk = el.querySelector('.ph-sort-dd-check');
  if (activeChk) activeChk.textContent = '✓';

  const nameEl = el.querySelector('.ph-sort-dd-name');
  if (btn && nameEl) {
    btn.textContent = nameEl.textContent + ' ▾';
  }

  closePhSortSheet(btnId, ddId, overlayId);
}
function closePhSortSheet(btnId, ddId, overlayId) {
  const dd = document.getElementById(ddId);
  const overlay = document.getElementById(overlayId);
  const btn = document.getElementById(btnId);
  if (dd) dd.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  if (btn) btn.textContent = btn.textContent.replace('⌃', '▾');
}
let _ncsAutoTimer = null;
let _ncsAutoRaf = null;
function ncsAutoStart() {
  // 기존 타이머 초기화
  clearTimeout(_ncsAutoTimer);
  cancelAnimationFrame(_ncsAutoRaf);
  const DURATION = 3000;
  const startTime = performance.now();
  const arc = document.getElementById('ncsAutoCountArc');
  const bar = document.getElementById('ncsAutoProgress');
  const num = document.getElementById('ncsAutoCountNum');
  const C = 62.8; // 2π*10
  function tick(now) {
    const elapsed = now - startTime;
    const pct = Math.min(elapsed / DURATION, 1);
    // 진행 바
    if (bar) bar.style.width = (pct * 100) + '%';
    // 원형 아크 (비워지는 방식)
    if (arc) arc.setAttribute('stroke-dashoffset', (C * pct).toFixed(2));
    // 카운트다운 숫자
    if (num) num.textContent = Math.max(1, Math.ceil(3 - pct * 3));
    if (pct < 1) {
      _ncsAutoRaf = requestAnimationFrame(tick);
    } else {
      ncsAutoFinish();
    }
  }
  _ncsAutoRaf = requestAnimationFrame(tick);
}
function ncsAutoFinish() {
  cancelAnimationFrame(_ncsAutoRaf);
  clearTimeout(_ncsAutoTimer);
  showToast('자동 알림이 설정되었습니다 🔔');
  showAppPage('home');
  updateSidebar('home');
}
/* ══ 나만의 알림 설정 위자드 ══ */
let _ncsStep = 1;
function ncsGoStep(n) {
  _ncsStep = n;
  // 스텝 표시
  document.querySelectorAll('.ncs-step').forEach((el,i) => {
    el.classList.toggle('on', i+1 === n);
  });
  // 도트 업데이트
  document.querySelectorAll('#ncsDots .ncs-dot').forEach((d,i) => {
    d.classList.toggle('on', i+1 === n);
  });
}
function ncsNext(n) { ncsGoStep(n); }

function switchHistTab(btn) {
  btn.closest('.hist-tabs').querySelectorAll('.hist-tab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
}
function switchHistPeriod(btn) {
  btn.closest('.hist-period-pills').querySelectorAll('.hist-pill').forEach(p => p.classList.remove('sel'));
  btn.classList.add('sel');
}
function toggleAutoNoti(isOn) {
  const header    = document.getElementById('naAutoHeader');
  const autoChans = document.getElementById('ns-auto-channels');
  const custom    = document.getElementById('ns-custom');
  if (!header) return;
  if (isOn) {
    header.classList.remove('dimmed');
    if (autoChans) autoChans.style.display = '';
    if (custom)    custom.style.display    = 'none';
  } else {
    header.classList.add('dimmed');
    if (autoChans) autoChans.style.display = 'none';
    if (custom)    custom.style.display    = '';
  }
}

function ncsToggleBrand(el) { ncsToggleCard(el); }
function ncsBrandToggleAll(btn) {
  const grid = document.querySelector('#ncs-step2 .ncs-brand-grid');
  if (!grid) return;
  const items = grid.querySelectorAll('.ncs-brand-item');
  const allSel = [...items].every(i => i.classList.contains('sel'));
  items.forEach(i => i.classList.toggle('sel', !allSel));
  btn.classList.toggle('active', !allSel);
}
function ncsBack() {
  if (_ncsStep <= 1) { goBack(); return; }
  ncsGoStep(_ncsStep - 1);
}
function ncsSyncAllToggle(stepId, chkId) {
  const step = document.getElementById('ncs-' + stepId);
  const chk = document.getElementById(chkId);
  if (!step || !chk) return;
  const cards = Array.from(step.querySelectorAll('.ncs-card, .ncs-brand-card'));
  chk.checked = cards.length > 0 && cards.every(c => c.classList.contains('sel'));
  chk.closest('.ncs-select-all-check')?.classList.toggle('checked', chk.checked);
}
function ncsToggleCard(el) {
  el.classList.toggle('sel');
  if (el.closest('#ncs-step2')) ncsSyncAllToggle('step2', 'ncs-brand-all');
}
/* step1 카테고리 토글 (Figma 607:12960 redesign) */
function ncsCatToggle(el) {
  el.classList.toggle('sel');
  const btn = document.getElementById('ncsCatAllBtn');
  if (!btn) return;
  const allSel = Array.from(document.querySelectorAll('#ncs-step1 .ncs-cat-item'))
    .every(i => i.classList.contains('sel'));
  btn.classList.toggle('active', allSel);
}
function ncsCatToggleAll(btn) {
  const items = document.querySelectorAll('#ncs-step1 .ncs-cat-item');
  const allSel = Array.from(items).every(i => i.classList.contains('sel'));
  items.forEach(i => allSel ? i.classList.remove('sel') : i.classList.add('sel'));
  btn.classList.toggle('active', !allSel);
}
function ncsToggleAll(stepId, chkId) {
  const chk = document.getElementById(chkId);
  if (!chk) return;
  setTimeout(() => {
    const isAll = chk.checked;
    chk.closest('.ncs-select-all-check')?.classList.toggle('checked', isAll);
    const step = document.getElementById('ncs-' + stepId);
    if (!step) return;
    step.querySelectorAll('.ncs-card, .ncs-brand-card').forEach(c => {
      isAll ? c.classList.add('sel') : c.classList.remove('sel');
    });
  }, 0);
}
function ncsFilterBrands(value) {
  const keyword = (value || '').trim().toLowerCase();
  document.querySelectorAll('#ncs-step2 .ncs-brand-item, #ncs-step2 .ncs-brand-card').forEach(card => {
    const label = card.textContent.trim().toLowerCase();
    card.style.display = !keyword || label.includes(keyword) ? '' : 'none';
  });
}
function ncsFinish() {
  showToast('알림 설정이 완료되었습니다 🔔');
  showAppPage('home');
  updateSidebar('home');
}

/* 원형 게이지 인터랙션 — 270° horseshoe, 135° 시작 */
(function initNcsDial() {
  let _ncsVal = 70;
  const DIAL_CENTER = 120;
  const DIAL_RADIUS = 90;
  const DIAL_CIRC = 2 * Math.PI * DIAL_RADIUS;
  const DIAL_START = 135;
  const DIAL_SWEEP = 270;
  const DIAL_TOTAL = DIAL_CIRC * DIAL_SWEEP / 360;
  const DIAL_OFFSET = -DIAL_CIRC * DIAL_START / 360;
  function updateDial(val) {
    _ncsVal = Math.max(0, Math.min(100, Math.round(val)));
    const filled = DIAL_TOTAL * _ncsVal / 100;
    const empty = DIAL_CIRC - filled;
    const track = document.querySelector('#ncsDial .dial-track');
    const arc = document.getElementById('ncsArc');
    const txt = document.getElementById('ncsValTxt');
    const cardVal = document.getElementById('ncsRateCardVal');
    const handle = document.getElementById('ncsHandle');
    if (!arc) return;
    if (track) {
      track.setAttribute('stroke-dasharray', DIAL_TOTAL.toFixed(1) + ' ' + (DIAL_CIRC - DIAL_TOTAL).toFixed(1));
      track.setAttribute('stroke-dashoffset', DIAL_OFFSET.toFixed(1));
    }
    arc.setAttribute('stroke-dasharray', filled.toFixed(1) + ' ' + empty.toFixed(1));
    arc.setAttribute('stroke-dashoffset', DIAL_OFFSET.toFixed(1));
    if (txt) txt.textContent = _ncsVal;
    if (cardVal) cardVal.textContent = _ncsVal;
    const angle = (DIAL_START + DIAL_SWEEP * _ncsVal / 100) * Math.PI / 180;
    const cx = DIAL_CENTER + DIAL_RADIUS * Math.cos(angle);
    const cy = DIAL_CENTER + DIAL_RADIUS * Math.sin(angle);
    if (handle) {
      handle.setAttribute('cx', cx.toFixed(1));
      handle.setAttribute('cy', cy.toFixed(1));
    }
  }
  function angleFromEvent(e, svg) {
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) / rect.width * 240 - DIAL_CENTER;
    const y = (clientY - rect.top) / rect.height * 240 - DIAL_CENTER;
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    let rel = angle - DIAL_START;
    if (rel < 0) rel += 360;
    if (rel > DIAL_SWEEP) rel = rel < (DIAL_SWEEP + (360 - DIAL_SWEEP) / 2) ? DIAL_SWEEP : 0;
    return rel / DIAL_SWEEP * 100;
  }
  let _dragging = false;
  document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('ncsDial');
    if (!svg) return;
    updateDial(70);
    const startDrag = (e) => { _dragging=true; updateDial(angleFromEvent(e,svg)); e.preventDefault(); };
    const moveDrag  = (e) => { if(_dragging){ updateDial(angleFromEvent(e,svg)); e.preventDefault(); } };
    const endDrag   = ()  => { _dragging=false; };
    svg.addEventListener('mousedown',  startDrag);
    svg.addEventListener('touchstart', startDrag, {passive:false});
    document.addEventListener('mousemove',  moveDrag);
    document.addEventListener('touchmove',  moveDrag, {passive:false});
    document.addEventListener('mouseup',    endDrag);
    document.addEventListener('touchend',   endDrag);
  });
})();
function switchNsTab(tab) {
  document.getElementById('ns-auto').style.display   = tab === 'auto'   ? '' : 'none';
  document.getElementById('ns-custom').style.display = tab === 'custom' ? '' : 'none';
  document.getElementById('nsTabAuto').classList.toggle('on',   tab === 'auto');
  document.getElementById('nsTabCustom').classList.toggle('on', tab === 'custom');
}
function switchBenefitsTab(tab) {
  document.getElementById('ph-cpn').style.display = tab === 'cpn' ? 'block' : 'none';
  document.getElementById('ph-pts').style.display  = tab === 'pts' ? 'block' : 'none';
  document.getElementById('phTabCpn').classList.toggle('on', tab === 'cpn');
  document.getElementById('phTabPts').classList.toggle('on', tab === 'pts');
  /* 포인트 탭 전환 시 바코드 재드로우 (hidden 상태에서 width=0 문제 해결) */
  if (tab === 'pts') {
    requestAnimationFrame(() => {
      initRepBrcSelect();
      const sel = document.getElementById('repBrcSelect');
      switchRepBarcodeCard(sel && sel.value ? sel.value : USE_POINTS[0].id);
    });
  }
}
function ptsFilterCat(el, cat) {
  const isAll = cat === 'all';
  const willTurnOff = !isAll && el.classList.contains('on');
  const nextCat = willTurnOff ? 'all' : cat;

  document.querySelectorAll('#ptsCatRow .pts-cat-chip').forEach(c => c.classList.remove('on'));
  if (nextCat === 'all') {
    document.querySelector('#ptsCatRow .pts-cat-chip[onclick*="all"]')?.classList.add('on');
  } else {
    el.classList.add('on');
  }

  document.querySelectorAll('.pts-list-card').forEach(card => {
    card.style.display = (nextCat === 'all' || card.dataset.cat === nextCat) ? '' : 'none';
  });
}
function getPointCategory(p) {
  const byId = {
    'PT-001': '편의점',
    'PT-002': '식품',
    'PT-003': '뷰티',
    'PT-004': '카페',
    'PT-005': '편의점',
    'PT-006': '식품',
    'PT-007': '뷰티',
    'PT-008': '식품',
    'PT-009': '배달',
    'PT-010': '카페'
  };
  if (byId[p.id]) return byId[p.id];
  const text = [p.name, p.issuer, p.places].filter(Boolean).join(' ');
  if (/배달|B마트|요기요|쿠팡이츠/.test(text)) return '배달';
  if (/올리브영|뷰티|헬스|H\.?Point|현대/i.test(text)) return '뷰티';
  if (/스타벅스|카페|베이커리|해피|SPC|파리|배스킨/i.test(text)) return '카페';
  if (/GS25|CU|편의점|세븐|이마트24/i.test(text)) return '편의점';
  if (/마트|이마트|신세계|롯데마트|다이소|SSG|GS슈퍼/i.test(text)) return '식품';
  if (/음식|푸드|외식|식당/i.test(text)) return '음식점';
  return '식품';
}
function phFilterCat(el, cat) {
  document.querySelectorAll('#phCatRow .ph-cat-chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  renderPhCpnList(cat);
  const searchInput = document.querySelector('#p-points-hub #ph-cpn .ph-search-input');
  if (searchInput && searchInput.value.trim()) filterPhCouponsBySearch(searchInput.value);
}
function filterPhCouponsBySearch(keyword) {
  const list = document.getElementById('phCpnList');
  if (!list) return;
  const query = (keyword || '').trim().toLowerCase();
  const cards = Array.from(list.querySelectorAll('.ph-cpn-card'));
  let visibleCount = 0;

  cards.forEach(card => {
    const searchText = [
      card.dataset.id,
      card.dataset.cat,
      card.querySelector('.ph-cpn-brand')?.textContent,
      card.querySelector('.ph-cpn-title')?.textContent,
      card.querySelector('.ph-cpn-cond')?.textContent,
      card.querySelector('.ph-cpn-date')?.textContent,
      card.querySelector('.ph-chip-cat')?.textContent,
      card.querySelector('.ph-ch-badge')?.textContent
    ].filter(Boolean).join(' ').toLowerCase();
    const matched = !query || searchText.includes(query);
    card.style.display = matched ? '' : 'none';
    if (matched) visibleCount += 1;
  });

  list.querySelectorAll('.ph-cpn-divider').forEach(divider => {
    divider.style.display = query ? 'none' : '';
  });
  const countLabel = document.getElementById('phCpnCountLabel');
  if (countLabel) {
    countLabel.textContent = query ? `검색 결과 ${visibleCount}장` : `보유 쿠폰 ${visibleCount}장`;
  }
}
function wltPhCat(el, cat) {
  document.querySelectorAll('#wltCatRow .ph-cat-chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  document.querySelectorAll('#wltCpnList .ph-cpn-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? 'flex' : 'none';
  });
}

function closeNearbySheet() {
  const sheet = document.getElementById('nearbySheet');
  sheet?.classList.remove('open');
  nbsStoreKey = null;
  nbsExpanded = false;
  document.getElementById('nearbySheetBg')?.classList.remove('show');
  /* 활성 핀 dot으로 복원 */
  if (activeStoreKey && storeMarkers[activeStoreKey]) {
    const prev=storeMarkers[activeStoreKey];
    prev.marker.setIcon(createMapPinIcon(prev.store));
    activeStoreKey=null;
    restoreNearbyPinsAfterSheet();
  }
  /* 트랜지션(350ms) 완료 후 시트 내용 완전 제거 */
  setTimeout(() => {
    if (sheet && !sheet.classList.contains('open')) sheet.innerHTML = '';
  }, 400);
}

function toggleFavMode() {
  favMode=!favMode;
  closeNearbySheet();
  Object.values(storeMarkers).forEach(({marker, store})=>{
    const el=marker.getElement();
    if (favMode && !store.fav) {
      marker.setOpacity(0);
      if (el) el.style.pointerEvents='none';
    } else {
      marker.setOpacity(1);
      if (el) el.style.pointerEvents='';
      marker.setIcon(createMapPinIcon(store));
    }
  });
}

/* 지도 필터 칩 선택 */
let nmapActiveFilter = 'all';
function nmapSelectChip(type, el) {
  nmapActiveFilter = type;
  // 칩 상태 업데이트
  ['nmapChipFav','nmapChipAll','nmapChipCoupon','nmapChipPoint'].forEach(id => {
    const chip = document.getElementById(id);
    if (!chip) return;
    chip.classList.remove('active');
    if (id === 'nmapChipFav') chip.classList.add('nmap-chip-fav');
  });
  if (el) el.classList.add('active');
  // fav 칩은 active여도 빨간 스타일 유지
  const favChip = document.getElementById('nmapChipFav');
  if (favChip) favChip.classList.add('nmap-chip-fav');

  // 마커 필터링
  favMode = (type === 'fav');
  closeNearbySheet();
  applyNearbyMapZoomMode();
}

function highlightNearbyItem(storeKey) {
  const list=document.getElementById('nearbyList');
  if (!list) return;
  list.querySelectorAll('.nearby-cpn-item').forEach(el=>el.classList.remove('map-selected'));
  const target=[...list.querySelectorAll('.nearby-cpn-item')].find(el=>(el.dataset.store||'')===storeKey);
  if (!target) return;
  target.classList.add('map-selected');
  list.scrollTo({top:target.offsetTop-list.offsetTop, behavior:'smooth'});
}

function selectNearbyItem(el) {
  const key=el.dataset.store;
  highlightNearbyItem(key);
  const s=NEARBY_STORES.find(x=>x.key===key);
  if (s) { activateStorePin(key); openNearbySheet(s); }
}

function toggleNearbyDetail(btn) {
  const item=btn.closest('.nearby-cpn-item');
  if (!item) return;
  const isExpanded=item.classList.contains('nci-expanded');
  document.querySelectorAll('.nearby-cpn-item.nci-expanded').forEach(el=>el.classList.remove('nci-expanded'));
  if (!isExpanded) { item.classList.add('nci-expanded'); selectNearbyItem(item); }
  if (nearbyMap) setTimeout(()=>nearbyMap.invalidateSize(),300);
}

/* ============================================================ LOADING ============================================================ */
function startLoading() {
  const steps=[{el:'ldStep1',c:'ldCirc1'},{el:'ldStep2',c:'ldCirc2'},{el:'ldStep3',c:'ldCirc3'}];
  steps.forEach(s=>{ const el=document.getElementById(s.el),c=document.getElementById(s.c); el.classList.remove('on','done'); c.className='step-circ'; c.textContent=''; });
  [[100,1200],[1400,2600],[2800,3900]].forEach(([on,done],i)=>{
    setTimeout(()=>{ document.getElementById(steps[i].el).classList.add('on'); document.getElementById(steps[i].c).className='step-circ spinning'; },on);
    setTimeout(()=>{ document.getElementById(steps[i].el).classList.add('done'); const c=document.getElementById(steps[i].c); c.className='step-circ done-circ'; c.textContent='✓'; },done);
  });
  setTimeout(()=>go('loading-result'),4500);
}
function countUp() {
  const el=document.getElementById('lrCount'); if(!el)return;
  let n=0; const t=setInterval(()=>{ el.textContent=++n; if(n>=47)clearInterval(t); },22);
}

/* ============================================================ KEYWORD SEARCH ============================================================ */
// 검색 결과 저장소
let srcAllCards = [];

/* 검색 결과용 home-cpn-card 생성 헬퍼 */
function makeSearchCard(brand, disc, title, expText, expNum, id, cat) {
  const expClass = expNum === 0 ? 'hcc-exp-red' : expNum <= 5 ? 'hcc-exp-org' : 'hcc-exp-gry';
  const status   = expNum === 0 ? 'expire' : expNum <= 5 ? 'expire' : 'available';
  const div = document.createElement('div');
  div.className = 'home-cpn-card';
  div.setAttribute('data-action', 'go-detail');
  div.setAttribute('data-id',     id);
  div.setAttribute('data-disc',   parseInt(disc) || 0);
  div.setAttribute('data-exp',    expNum);
  div.setAttribute('data-status', status);
  div.setAttribute('data-cat',    cat || '');
  div.innerHTML = `
    <div class="hcc-brand">${brand}</div>
    <div class="hcc-disc">${disc}</div>
    <div class="hcc-title">${title}</div>
    <div class="hcc-exp ${expClass}">${expText}</div>
    <button class="pill-dl-btn" onclick="handleDownload(this);event.stopPropagation()">
      <span class="pdb-icon-wrap">↓</span><span class="pdb-text">쿠폰 다운로드</span>
    </button>`;
  return div;
}

/* 홈 카드(home-cpn-card) → 검색 결과 카드 변환 */
function homeToCpnCard(homeCard) {
  const brand   = homeCard.querySelector('.hcc-brand')?.textContent || '';
  const disc    = homeCard.querySelector('.hcc-disc')?.textContent  || '';
  const title   = homeCard.querySelector('.hcc-title')?.textContent || '';
  const expText = homeCard.querySelector('.hcc-exp')?.textContent   || '';
  const id      = homeCard.dataset.id  || '';
  const cat     = homeCard.dataset.cat || '';
  let expNum = 999;
  if (expText === '오늘 만료') expNum = 0;
  else { const m = expText.match(/D-(\d+)/); if (m) expNum = parseInt(m[1]); }
  return makeSearchCard(brand, disc, title, expText, expNum, id, cat);
}

/* 지갑 카드(cpn-card) → 검색 결과 카드 변환 */
function walletToCpnCard(walletCard) {
  const brand   = walletCard.querySelector('.cpn-brand')?.textContent  || walletCard.querySelector('.wlt-brand-nm,span[class*="brand"]')?.textContent || '';
  const title   = walletCard.querySelector('.cpn-title,.wlt-cpn-ttl')?.textContent || '';
  const disc    = walletCard.dataset.disc ? walletCard.dataset.disc + '%' : '';
  const expNum  = parseInt(walletCard.dataset.exp ?? 999);
  const expText = expNum === 0 ? '오늘 만료' : (expNum < 999 ? 'D-' + expNum : '');
  const id      = walletCard.dataset.id  || '';
  const cat     = walletCard.dataset.cat || '';
  return makeSearchCard(brand, disc, title, expText, expNum, id, cat);
}

function doSearch(kw) {
  if (!kw.trim()) return;
  S.searchKw = kw.trim();
  showAppPage('search'); updateSidebar('');
  const badge = document.getElementById('searchKwBadge');
  if (badge) badge.textContent = '"' + S.searchKw + '"';
  const kwLow = S.searchKw.toLowerCase();

  /* 홈 카드 검색 — 브랜드명·쿠폰제목 기준 */
  const homeMatched = [...document.querySelectorAll('#homeSections .home-cpn-card')]
    .filter(c => {
      const brand = (c.querySelector('.hcc-brand')?.textContent || '').toLowerCase();
      const title = (c.querySelector('.hcc-title')?.textContent || '').toLowerCase();
      return brand.includes(kwLow) || title.includes(kwLow);
    })
    .map(c => homeToCpnCard(c));
  const homeIds = new Set(homeMatched.map(c => c.dataset.id));

  /* 지갑 카드 검색 — 브랜드명·쿠폰제목 기준, 홈 결과와 중복 제거 */
  const walletMatched = [...document.querySelectorAll('#walletGrid .cpn-card')]
    .filter(c => {
      if (homeIds.has(c.dataset.id)) return false;
      const brand = (c.querySelector('.cpn-brand,.wlt-brand-nm')?.textContent || '').toLowerCase();
      const title = (c.querySelector('.cpn-title,.wlt-cpn-ttl')?.textContent  || '').toLowerCase();
      return brand.includes(kwLow) || title.includes(kwLow);
    })
    .map(c => walletToCpnCard(c));

  srcAllCards = [...homeMatched, ...walletMatched];
  // 카테고리 탭 초기화 (전체 on)
  document.querySelectorAll('[data-action="src-filter"]').forEach(b => b.classList.toggle('on', b.dataset.val === 'all'));
  document.querySelectorAll('[data-action="src-tab"]').forEach(b => b.classList.toggle('on', b.dataset.status === 'all'));
  // 카운트 업데이트
  const cats = ['food','fashion','appliance','culture'];
  const ids  = {food:'srcCntFood',fashion:'srcCntFashion',appliance:'srcCntAppliance',culture:'srcCntCulture'};
  const el = document.getElementById('srcCntAll');
  if (el) el.textContent = srcAllCards.length;
  cats.forEach(cat => {
    const n = srcAllCards.filter(c => (c.dataset.cat||'') === cat).length;
    const cel = document.getElementById(ids[cat]);
    if (cel) cel.textContent = n;
  });
  renderSrcGrid(srcAllCards);
}

function renderSrcGrid(cards) {
  const list = document.getElementById('searchResultList');
  const cnt  = document.getElementById('searchCount');
  if (!list) return;
  list.innerHTML = '';
  if (cards.length === 0) {
    list.innerHTML = '<div style="padding:60px 0;text-align:center;color:var(--gray-400);font-size:18px;grid-column:1/-1">검색 결과가 없습니다</div>';
  } else {
    cards.forEach(c => list.appendChild(c.cloneNode(true)));
  }
  if (cnt) cnt.textContent = cards.length + '개 결과';
}

const HSS_ROLLING_WORDS = [
  '커피','마트 쿠폰','편의점 할인','배달 특가','스타벅스','패션·뷰티',
  '여행','이마트','카페 음료','치킨','피자','영화 티켓',
  '쇼핑몰','헬스·운동','레스토랑','디저트','세탁·청소','숙박'
];
let _hssRollingIdx = 0;
let _hssRollingTimer = null;
function _hssNextKw() {
  _hssRollingIdx = (_hssRollingIdx + 1) % HSS_ROLLING_WORDS.length;
  const kw = document.getElementById('hssRollingKw');
  if (!kw) return;
  kw.style.animation = 'none';
  kw.offsetWidth; /* reflow */
  kw.textContent = HSS_ROLLING_WORDS[_hssRollingIdx];
  kw.style.animation = '';
}
function startHssRolling() {
  if (_hssRollingTimer) return;
  _hssRollingTimer = setInterval(_hssNextKw, 2000);
}
function stopHssRolling() {
  clearInterval(_hssRollingTimer);
  _hssRollingTimer = null;
}
function openHomeSearchSheet() {
  stopHssRolling();
  const kw = document.getElementById('hssRollingKw');
  if (kw) { kw.style.animation='none'; kw.offsetWidth; kw.textContent='카페'; kw.style.animation=''; }
  const sheet = document.getElementById('homeSearchSheet');
  const src = document.getElementById('homeBigSearch');
  const inp = document.getElementById('homeSearchSheetInput');
  const sel = document.getElementById('homeSearchSheetCatSel');
  if (!sheet) return;
  if (inp && src && !inp.value.trim()) inp.value = src.value.trim();
  if (sel) sel.value = '전체';
  sheet.style.display = 'flex';
  sheet.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => sheet.classList.add('show'));
  setTimeout(() => { if (inp) { inp.focus(); hssSyncTypingState(); } }, 40);
}

function clearRecentSearches() {
  _hssRecentSearches = [];
  _renderHssRecentSearches();
}
function closeHomeSearchSheet() {
  const sheet = document.getElementById('homeSearchSheet');
  if (!sheet) return;
  stopHssRolling();
  sheet.classList.remove('show');
  sheet.setAttribute('aria-hidden', 'true');
  resetHomeSearchSheetDetail();
  setTimeout(() => { sheet.style.display = 'none'; }, 280);
}

function hssSyncTypingState() {
  const pill = document.querySelector('#homeSearchSheet .hss-search-pill');
  const inp = document.getElementById('homeSearchSheetInput');
  if (!pill || !inp) return;
  pill.classList.toggle('is-typing', !!inp.value.trim());
}

function hssClearSearchInput() {
  const inp = document.getElementById('homeSearchSheetInput');
  if (!inp) return;
  inp.value = '';
  _showHssSearchHome();
  inp.focus();
  hssSyncTypingState();
}

function hssExitTypingState() {
  const inp = document.getElementById('homeSearchSheetInput');
  if (inp) inp.blur();
  resetHomeSearchSheetDetail();
  hssSyncTypingState();
}

let _hssActiveCat = '';
let _hssActiveBrand = '전체';
let _hssRows = [];
let _hssAllCards = null; // 정적 카드 캐시
let _hssRecentSearches = ['GS25', '이마트', '배달의 민족'];

function _escapeHssRecentKeyword(keyword) {
  return String(keyword).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function _renderHssRecentSearches() {
  const chips = document.getElementById('hssRecentChips');
  if (!chips) return;
  if (!_hssRecentSearches.length) {
    chips.innerHTML = '<span class="hss-recent-empty">최근 검색어가 없습니다</span>';
    return;
  }
  chips.innerHTML = _hssRecentSearches.map(keyword =>
    `<button class="hss-recent-chip" onclick="searchHomeSheetCoupons('${_escapeHssRecentKeyword(keyword)}')">${keyword}</button>`
  ).join('');
}

function _addHssRecentSearch(keyword) {
  const value = (keyword || '').trim();
  if (!value) return;
  _hssRecentSearches = _hssRecentSearches.filter(item => item !== value);
  _hssRecentSearches.push(value);
  if (_hssRecentSearches.length > 5) {
    _hssRecentSearches = _hssRecentSearches.slice(_hssRecentSearches.length - 5);
  }
  _renderHssRecentSearches();
}

const HSS_CAT_MAP = {
  '마트':   { brands: ['이마트', '홈플러스', '롯데마트', '쿠팡'] },
  '편의점': { brands: ['GS25', '맥도날드'] },
  '배달':   { brands: ['배달의민족', '요기요'] },
  '카페':   { brands: ['스타벅스', '투썸플레이스'] },
  '뷰티':   { brands: ['올리브영'] },
  '패션':   { brands: ['올리브영', '무신사'] },
  '여행':   { brands: ['야놀자', '여기어때'] },
  '문화':   { brands: ['CGV', '메가박스', '롯데시네마'] },
  '푸드':   { brands: ['배달의민족', '요기요'] }
};

function getHssCouponIdFromCard(el) {
  const directId = el?.dataset?.id || '';
  if (directId) return directId;
  const brand = el?.dataset?.brand || '';
  const title = el?.querySelector('.hss-cpn-title')?.textContent?.trim() || '';
  const exact = USE_COUPONS.find(c =>
    c.brand === brand &&
    (c.name === title || c.name.includes(title) || title.includes(c.name))
  );
  if (exact) return exact.id;
  const brandFallback = {
    '이마트': 'CP-013',
    '홈플러스': 'CP-014',
    '롯데마트': 'CP-013',
    '쿠팡': 'CP-019',
    'GS25': 'CP-015',
    'CU': 'CP-016',
    '맥도날드': 'CP-020',
    '스타벅스': 'CP-001',
    '투썸플레이스': 'CP-002',
    '이디야커피': 'CP-003',
    '메가커피': 'CP-004',
    '배달의민족': 'CP-017',
    '요기요': 'CP-018',
    '올리브영': 'CP-011',
    '무신사': 'CP-008',
    '야놀자': 'CP-026',
    '여기어때': 'CP-026',
    'CGV': 'CP-023',
    '메가박스': 'CP-025',
    '롯데시네마': 'CP-024'
  };
  return brandFallback[brand] || USE_COUPONS.find(c => c.brand === brand)?.id || '';
}

function _initHssCards() {
  if (_hssAllCards) return;
  // 최초 1회: 정적 카드를 source 저장소로 이동 후 캐싱
  const list = document.getElementById('hssCouponList');
  const src  = document.getElementById('hssCouponSource');
  if (!list || !src) return;
  [...list.querySelectorAll('.hss-cpn-card')].forEach(el => src.appendChild(el));
  _hssAllCards = [...src.querySelectorAll('.hss-cpn-card')].map(el => ({
    id: getHssCouponIdFromCard(el),
    brand: el.dataset.brand || '',
    title: el.querySelector('.hss-cpn-title')?.textContent || '',
    node: el
  }));
}

function _getHssAllCards() {
  _initHssCards();
  return _hssAllCards || [];
}

function isHssCouponFav(id) {
  return !!USE_COUPONS.find(c => c.id === id)?.fav;
}

function setHssResultHeartState(btn, isOn) {
  if (!btn) return;
  btn.classList.toggle('on', !!isOn);
  btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
}

function toggleHssResultHeart(id, btn) {
  const cpn = USE_COUPONS.find(c => c.id === id);
  if (!cpn) return;
  cpn.fav = !cpn.fav;
  document
    .querySelectorAll(`.hss-result-card[data-id="${id}"] .hss-result-heart`)
    .forEach(item => setHssResultHeartState(item, cpn.fav));
}

function openHssResultDetail(id) {
  if (!id || !ACT['go-detail']) return;
  const sheet = document.getElementById('homeSearchSheet');
  if (sheet) {
    sheet.classList.remove('show');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.style.display = 'none';
  }
  ACT['go-detail']({ target: { dataset: { id } } });
}

function _renderHssRows() {
  const list = document.getElementById('hssCouponList');
  if (!list) return;
  const kw = (document.getElementById('homeSearchSheetInput')?.value || '').trim().toLowerCase();
  const cfg = _hssActiveCat ? (HSS_CAT_MAP[_hssActiveCat] || { brands: [] }) : null;
  const catBrands = cfg ? cfg.brands : null;

  const all = _getHssAllCards();
  const filtered = all.filter(r => {
    const catOk  = !catBrands || catBrands.includes(r.brand);
    const chipOk = _hssActiveBrand === '전체' || r.brand === _hssActiveBrand;
    const kwOk   = !kw || r.brand.toLowerCase().includes(kw) || r.title.toLowerCase().includes(kw);
    return catOk && chipOk && kwOk;
  });

  if (!filtered.length) {
    list.innerHTML = '<div class="hss-empty">해당 조건의 쿠폰이 없습니다</div>';
    return;
  }
  list.innerHTML = '';
  filtered.forEach(r => list.appendChild(r.node.cloneNode(true)));
}

function _renderHssBrandChips(brands) {
  const wrap = document.getElementById('hssBrandChips');
  if (!wrap) return;
  const all = ['전체', ...brands];
  wrap.innerHTML = all.map(b =>
    '<button class="hss-brand-chip' + (b === _hssActiveBrand ? ' on' : '') + '" type="button" onclick="filterHomeSearchBrand(\'' + b + '\')">' + b + '</button>'
  ).join('');
}

function filterHomeSearchBrand(brand) {
  _hssActiveBrand = brand;
  const cfg = HSS_CAT_MAP[_hssActiveCat] || { brands: [] };
  _renderHssBrandChips(cfg.brands);
  _renderHssRows();
}

function hssHandleSearchKey(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  searchHomeSheetCoupons(event.currentTarget.value);
}

function _setHssSearchSubmitted(isSubmitted) {
  const pill = document.querySelector('#homeSearchSheet .hss-search-pill');
  if (pill) pill.classList.toggle('is-submitted', !!isSubmitted);
}

function _showHssSearchHome() {
  const catSection = document.getElementById('hssCatSection');
  const resultArea = document.getElementById('hssResultArea');
  const recentSection = document.querySelector('#homeSearchSheet .hss-recent-section');
  if (catSection) catSection.style.display = 'block';
  if (resultArea) resultArea.style.display = 'none';
  if (recentSection) recentSection.style.display = 'block';
  _setHssSearchSubmitted(false);
}

function _renderHssKeywordResults(keyword) {
  const resultArea = document.getElementById('hssResultArea');
  const resultList = document.getElementById('hssResultList');
  const empty = document.getElementById('hssEmptyResult');
  const catSection = document.getElementById('hssCatSection');
  const recentSection = document.querySelector('#homeSearchSheet .hss-recent-section');
  const resultCatSection = resultArea?.querySelector('.hss-cat-section');
  const resultChips = document.getElementById('hssResultChips');
  if (!resultArea || !resultList || !empty) return;

  if (catSection) catSection.style.display = 'none';
  if (recentSection) recentSection.style.display = 'none';
  if (resultCatSection) resultCatSection.style.display = 'none';
  if (resultChips) resultChips.style.display = 'none';
  resultArea.style.display = 'block';
  _setHssSearchSubmitted(true);

  const normalized = (keyword || '').trim().toLowerCase();
  const matchedCategoryBrands = Object.entries(HSS_CAT_MAP)
    .filter(([cat]) => cat.toLowerCase().includes(normalized) || normalized.includes(cat.toLowerCase()))
    .flatMap(([, cfg]) => cfg.brands || []);
  const all = _getHssAllCards();
  const filtered = all.filter(r => {
    if (!normalized) return false;
    return r.brand.toLowerCase().includes(normalized) ||
      r.title.toLowerCase().includes(normalized) ||
      matchedCategoryBrands.includes(r.brand);
  });

  if (!filtered.length) {
    if (recentSection) recentSection.style.display = 'block';
    resultList.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  const heartSvg = `<svg width="19" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  resultList.innerHTML = `<p class="hss-result-heading">검색 결과</p>` + filtered.map(r => {
    const logo = HSS_BRAND_LOGO[r.brand] || '';
    const logoHtml = logo
      ? `<img src="${logo}" alt="${r.brand}">`
      : `<span class="hss-result-logo-fallback">${r.brand.charAt(0)}</span>`;
    const dateText = r.node.querySelector('.hss-cpn-date')?.textContent.replace('~', '') || '2026-07-31';
    const isFav = isHssCouponFav(r.id);
    return `<div class="hss-result-card" data-id="${r.id}">
      <div class="hss-result-logo">${logoHtml}</div>
      <div class="hss-result-info">
        <span class="hss-result-brand">${r.brand}</span>
        <p class="hss-result-title">${r.title}</p>
        <p class="hss-result-cond">8만원 이상 주문 시 사용 가능</p>
        <p class="hss-result-exp">유효기간 ${dateText}</p>
      </div>
      <div class="hss-result-right">
        <button class="hss-result-heart${isFav ? ' on' : ''}" aria-label="찜" aria-pressed="${isFav ? 'true' : 'false'}" onclick="event.stopPropagation();toggleHssResultHeart('${r.id}',this)">${heartSvg}</button>
        <button class="hss-result-use-btn" onclick="event.stopPropagation();openHssResultDetail('${r.id}')">사용하기</button>
      </div>
    </div>`;
  }).join('');
}

function searchHomeSheetCoupons(keyword) {
  const inp = document.getElementById('homeSearchSheetInput');
  const value = (keyword || '').trim();
  if (inp) inp.value = value;
  _addHssRecentSearch(value);
  hssSyncTypingState();
  _renderHssKeywordResults(value);
  if (inp) inp.blur();
}

function resetHomeSearchSheetDetail() {
  _hssActiveCat = '';
  _hssActiveBrand = '전체';
  _showHssSearchHome();
  // 검색 입력 초기화
  const inp = document.getElementById('homeSearchSheetInput');
  if (inp) inp.value = '';
  hssSyncTypingState();
}

/* 카테고리 SVG 아이콘 맵 */
const HSS_CAT_SVG = {
  '마트':   '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
  '편의점': '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
  '카페':   '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 8h1a4 4 0 0 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>',
  '배달':   '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="1"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
  '푸드':   '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"></path></svg>',
  '패션':   '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"></path></svg>',
  '뷰티':   '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.79V7a2.5 2.5 0 0 1 4.5-1.5"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.79V7a2.5 2.5 0 0 0-4.5-1.5"></path></svg>',
  '문화':   '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
  '여행':   '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 4c-1 0-2 1-2 1L7 9l-6-2.5 1 3L7 12l-2 7 3.5-1L12 15l2 5.5z"></path></svg>',
  '기타':   '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>',
};

/* 카테고리별 브랜드 로고 경로 */
const HSS_BRAND_LOGO = {
  '이마트': '로고/emart.svg', '홈플러스': '로고/homeplus.svg',
  '롯데마트': '로고/lottemart.svg', '쿠팡': '로고/coupang.svg',
  'GS25': '로고/gs25.svg', '맥도날드': '로고/mcdonalds.svg',
  '스타벅스': '로고/starbucks.svg', '투썸플레이스': '로고/twosome.svg',
  '배달의민족': '로고/baemin.svg', '요기요': '로고/yogiyo.svg',
  '올리브영': '로고/oliveyoung.svg', '무신사': '로고/musinsa.svg',
  '야놀자': '로고/yanolja.svg', '여기어때': '로고/yeogi.svg',
  'CGV': '로고/cgv.svg', '메가박스': '로고/megabox.svg',
  '롯데시네마': '로고/lottecinema.svg',
};

function _renderHssResultChips(brands, activeBrand) {
  const wrap = document.getElementById('hssResultChips');
  if (!wrap) return;
  wrap.innerHTML = brands.map(b =>
    `<button class="hss-result-chip${b === activeBrand ? ' on' : ''}" onclick="filterHssResult('${b}')">${b}</button>`
  ).join('');
}

function filterHssResult(brand) {
  _hssActiveBrand = brand;
  const cfg = HSS_CAT_MAP[_hssActiveCat] || { brands: [] };
  _renderHssResultChips(cfg.brands, brand);
  _renderHssResultCards();
}

function _renderHssResultCards() {
  const list = document.getElementById('hssResultList');
  if (!list) return;
  const all = _getHssAllCards();
  const cfg = _hssActiveCat ? (HSS_CAT_MAP[_hssActiveCat] || { brands: [] }) : { brands: [] };
  const filtered = all.filter(r => {
    const catOk  = !cfg.brands.length || cfg.brands.includes(r.brand);
    const chipOk = _hssActiveBrand === '전체' || r.brand === _hssActiveBrand;
    return catOk && chipOk;
  });

  const heartSvg = `<svg width="19" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

  if (!filtered.length) {
    list.innerHTML = `<div style="padding:var(--spacing-32) 0;text-align:center;font-size:var(--font-size-caption);color:var(--color-gray-300);font-family:var(--font)">해당 조건의 쿠폰이 없습니다</div>`;
    return;
  }

  list.innerHTML = filtered.map(r => {
    const logo = HSS_BRAND_LOGO[r.brand] || '';
    const logoHtml = logo
      ? `<img src="${logo}" alt="${r.brand}" style="width:100%;height:100%;object-fit:contain">`
      : `<span style="font-size:var(--font-size-headline-sm);font-weight:var(--font-weight-heavy);color:var(--color-gray-400);font-family:var(--font)">${r.brand.charAt(0)}</span>`;
    const dateEl = r.node.querySelector('.hss-cpn-date');
    const dateText = dateEl ? dateEl.textContent.replace('~','') : '';
    const disc = r.node.querySelector('.hss-cpn-disc')?.textContent || '';
    const isFav = isHssCouponFav(r.id);
    return `<div class="hss-result-card" data-id="${r.id}">
      <div class="hss-result-logo">${logoHtml}</div>
      <div class="hss-result-info">
        <span class="hss-result-brand">${r.brand}</span>
        <p class="hss-result-title">${r.title}${disc ? ' ' + disc : ''}</p>
        <p class="hss-result-exp">유효기간 ${dateText}</p>
      </div>
      <div class="hss-result-right">
        <button class="hss-result-heart${isFav ? ' on' : ''}" aria-label="찜" aria-pressed="${isFav ? 'true' : 'false'}" onclick="event.stopPropagation();toggleHssResultHeart('${r.id}',this)">${heartSvg}</button>
        <button class="hss-result-use-btn" onclick="event.stopPropagation();openHssResultDetail('${r.id}')">사용하기</button>
      </div>
    </div>`;
  }).join('');
}

function searchByCategory(keyword) {
  const inp = document.getElementById('homeSearchSheetInput');
  if (inp) inp.value = '';
  _hssActiveCat = keyword;
  _hssActiveBrand = '전체';

  // 카테고리 그리드 숨기고 결과 영역 표시
  const catSection = document.getElementById('hssCatSection');
  const resultArea = document.getElementById('hssResultArea');
  const recentSection = document.querySelector('#homeSearchSheet .hss-recent-section');
  if (catSection) catSection.style.display = 'none';
  if (resultArea) resultArea.style.display = 'block';
  if (recentSection) recentSection.style.display = 'none';
  const resultCatSection = resultArea?.querySelector('.hss-cat-section');
  const resultChips = document.getElementById('hssResultChips');
  const empty = document.getElementById('hssEmptyResult');
  if (resultCatSection) resultCatSection.style.display = 'block';
  if (resultChips) resultChips.style.display = 'flex';
  if (empty) empty.style.display = 'none';
  _setHssSearchSubmitted(false);

  // 선택된 카테고리 단독 표시
  const wrap = document.getElementById('hssSelectedCatWrap');
  if (wrap) {
    const svg = HSS_CAT_SVG[keyword] || '';
    wrap.innerHTML = `<button class="hss-cat-item selected" style="pointer-events:none">
      <div class="hss-cat-ico">${svg}</div>
      <span class="hss-cat-txt">${keyword}</span>
    </button>`;
  }

  // 브랜드 칩 + 카드 렌더링
  const cfg = HSS_CAT_MAP[keyword] || { brands: [] };
  _renderHssResultChips(cfg.brands, '전체');
  _renderHssResultCards();
}

/* ============================================================ BARCODE INSTANT POPUP ============================================================ */
/* ============================================================
   알림 드롭다운
   ============================================================ */
let _notiUnread = 3;
function toggleNotiDrop() {
  const drop = document.getElementById('notiDropdown');
  const back = document.getElementById('notiBackdrop');
  const btn  = document.getElementById('bellBtn');
  const isOpen = drop.classList.contains('open');
  if (isOpen) {
    closeNotiDrop();
  } else {
    drop.classList.add('open');
    back.classList.add('open');
    btn.classList.add('open');
  }
}
function closeNotiDrop() {
  document.getElementById('notiDropdown')?.classList.remove('open');
  document.getElementById('notiBackdrop')?.classList.remove('open');
  document.getElementById('bellBtn')?.classList.remove('open');
}
function clearNotiAll() {
  document.querySelectorAll('.noti-item.unread').forEach(i=>i.classList.remove('unread'));
  document.querySelectorAll('.noti-unread-dot').forEach(d=>d.remove());
  _notiUnread = 0;
  const badge = document.getElementById('bellBadge');
  if (badge) badge.style.display = 'none';
}

/* ── 바코드 확대 모달 ── */
function openBrcZoom(srcId, numText, label) {
  const modal  = document.getElementById('brcZoomModal'); if (!modal) return;
  const zSvg   = document.getElementById('brcZoomSvg');
  const zNum   = document.getElementById('brcZoomNum');
  const zLabel = document.getElementById('brcZoomLabel');
  const srcSvg = document.getElementById(srcId);
  if (zLabel) zLabel.textContent = label || '바코드';
  if (zNum)   zNum.textContent   = numText || '';
  if (zSvg && srcSvg) {
    zSvg.setAttribute('viewBox', srcSvg.getAttribute('viewBox') || '0 0 400 120');
    zSvg.innerHTML = srcSvg.innerHTML;
  }
  modal.classList.add('open');
  _lockAllScroll();   /* 전체 스크롤 잠금 */
}
function closeBrcZoom() {
  const modal = document.getElementById('brcZoomModal'); if (!modal) return;
  modal.classList.remove('open');
  _unlockAllScroll(); /* 스크롤 복원 */
}

function toggleDetInfo(btn) {
  const chevron = btn.querySelector('.det-info-chevron');
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chevron.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}

/* ── 포인트 바코드 확대 모달 ── */
/* 전체 스크롤 잠금 / 해제 헬퍼 */
function _lockAllScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  // 모든 SPA 스크롤 컨테이너 잠금 (상세페이지·포인트페이지·공통)
  ['.main-content', '.det-scroll-content', '#ph-pts', '#ph-cpn',
   '#p-points-hub', '#p-detail', '.app-body'].forEach(function(sel) {
    var el = document.querySelector(sel);
    if (el) { el._prevOverflow = el.style.overflowY; el.style.overflowY = 'hidden'; }
  });
}
function _unlockAllScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  ['.main-content', '.det-scroll-content', '#ph-pts', '#ph-cpn',
   '#p-points-hub', '#p-detail', '.app-body'].forEach(function(sel) {
    var el = document.querySelector(sel);
    if (el) { el.style.overflowY = el._prevOverflow || ''; }
  });
}

function openPtsBrcZoom() {
  const overlay = document.getElementById('ptsBrcZoomOverlay');
  if (!overlay) return;

  // 브랜드명 동기화
  const brand = document.getElementById('repBrcBrandLbl');
  if (brand) document.getElementById('ptsBrcZoomBrand').textContent = brand.textContent;

  // 포인트 금액 — 선택된 서비스 카드의 잔액에서 가져오거나 기본값
  const activeBal = document.querySelector('#ptsSvcGrid .pts-list-card:first-child .pts-lc-bal');
  const zoomAmt = document.getElementById('ptsBrcZoomAmount');
  if (activeBal && zoomAmt) {
    const unit = activeBal.querySelector('.pts-lc-unit');
    zoomAmt.textContent = (unit ? activeBal.textContent.replace(unit.textContent,'') : activeBal.textContent).trim() + 'p';
  }

  // 바코드 SVG 복사
  const src = document.getElementById('ptsRepBrc');
  const dest = document.getElementById('ptsBrcZoomSvg');
  if (src && dest) dest.innerHTML = src.innerHTML;

  // 번호 동기화
  const num = document.getElementById('repBrcNum');
  if (num) document.getElementById('ptsBrcZoomNum').textContent = num.textContent;

  overlay.classList.add('open');
  _lockAllScroll();   // 모든 스크롤 잠금
}
function closePtsBrcZoom(e) {
  if (!e || e.target === e.currentTarget) {
    const overlay = document.getElementById('ptsBrcZoomOverlay');
    if (overlay) overlay.classList.remove('open');
    _unlockAllScroll();  // 스크롤 복원
  }
}

/* ── 상세페이지 스크롤 잠금 헬퍼 ── */
function _detScrollLock() {
  // 실제 스크롤이 일어나는 det-scroll-content를 잠금
  const sc = document.querySelector('#p-detail .det-scroll-content');
  if (sc) sc.style.overflowY = 'hidden';
}
function _detScrollUnlock() {
  const sc = document.querySelector('#p-detail .det-scroll-content');
  if (sc) sc.style.overflowY = '';
}

/* ── 지도 검색 인터렉션 (인플레이스) ── */
function nmapOpenSearch() {
  const def    = document.getElementById('nmapLocDefault');
  const active = document.getElementById('nmapLocActive');
  const input  = document.getElementById('nmapSearchInputActive');
  if (!def || !active) return;
  def.style.display    = 'none';
  active.style.display = 'flex';
  setTimeout(() => input && input.focus(), 30);
}
function nmapCloseSearch() {
  const def     = document.getElementById('nmapLocDefault');
  const active  = document.getElementById('nmapLocActive');
  const input   = document.getElementById('nmapSearchInputActive');
  const locText = document.getElementById('nmapLocationText');
  const clearBtn= document.getElementById('nmapClearBtn');
  if (!def || !active) return;
  active.style.display = 'none';
  def.style.display    = 'flex';
  const val = input ? input.value.trim() : '';
  if (locText)  locText.textContent = val || '현재 위치를 검색해 주세요';
  if (input)    input.blur();
  if (clearBtn) clearBtn.classList.remove('visible');
}
function nmapOnSearchInput(el) {
  const clearBtn = document.getElementById('nmapClearBtn');
  if (clearBtn) clearBtn.classList.toggle('visible', el.value.length > 0);
}
function nmapClearSearch() {
  const input    = document.getElementById('nmapSearchInputActive');
  const clearBtn = document.getElementById('nmapClearBtn');
  if (input)    { input.value = ''; input.focus(); }
  if (clearBtn) clearBtn.classList.remove('visible');
}

/* ── 홈 리뉴얼 칩 선택 + 캐러셀 도트 ── */
/* ── 홈 페이지 렌더링 ── */

function renderHomeStats() {
  const ptEl  = document.getElementById('hmStatPoints');
  const cpnEl = document.getElementById('hmStatCoupons');
  const cpnCntEl = document.querySelector('.hm2-cpn-count');
  if (ptEl) {
    const total = (typeof USE_POINTS !== 'undefined' ? USE_POINTS : [])
      .reduce((s, p) => s + (p.balance || 0), 0);
    ptEl.textContent = total.toLocaleString('ko-KR') + ' P';
  }
  if (cpnEl) {
    cpnEl.textContent = USE_COUPONS.length + '장';
  }
  if (cpnCntEl) {
    cpnCntEl.textContent = '(' + USE_COUPONS.length + ')';
  }
}


const INLINE_VERTICAL_COUPON_SVG_SRC = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22159%22%20height%3D%22276%22%20viewBox%3D%220%200%20159%20276%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cmask%20id%3D%22path-1-inside-1_1086_24421%22%20fill%3D%22white%22%3E%0A%3Cpath%20d%3D%22M147.026%20203.58C147.43%20209.609%20152.577%20214.378%20158.869%20214.378C158.913%20214.378%20158.956%20214.376%20159%20214.376V260.415C159%20269.022%20151.836%20276%20143%20276H16C7.16352%20276%200.000126996%20269.022%200%20260.415V214.376C6.23188%20214.31%2011.3103%20209.567%2011.7109%20203.58H147.026ZM143%2013C151.836%2013%20159%2019.9776%20159%2028.585V191.257C158.956%20191.256%20158.913%20191.256%20158.869%20191.256C152.395%20191.256%20147.132%20196.304%20147.003%20202.58H11.7344C11.6058%20196.347%206.41351%20191.324%200%20191.257V28.585C0.000124342%2019.9776%207.16352%2013%2016%2013H143Z%22%2F%3E%0A%3C%2Fmask%3E%0A%3Cpath%20d%3D%22M147.026%20203.58C147.43%20209.609%20152.577%20214.378%20158.869%20214.378C158.913%20214.378%20158.956%20214.376%20159%20214.376V260.415C159%20269.022%20151.836%20276%20143%20276H16C7.16352%20276%200.000126996%20269.022%200%20260.415V214.376C6.23188%20214.31%2011.3103%20209.567%2011.7109%20203.58H147.026ZM143%2013C151.836%2013%20159%2019.9776%20159%2028.585V191.257C158.956%20191.256%20158.913%20191.256%20158.869%20191.256C152.395%20191.256%20147.132%20196.304%20147.003%20202.58H11.7344C11.6058%20196.347%206.41351%20191.324%200%20191.257V28.585C0.000124342%2019.9776%207.16352%2013%2016%2013H143Z%22%20fill%3D%22white%22%2F%3E%0A%3Cpath%20d%3D%22M147.026%20203.58L148.523%20203.48L148.429%20202.08H147.026V203.58ZM158.869%20214.378V215.878H158.869L158.869%20214.378ZM159%20214.376H160.5V212.86L158.984%20212.876L159%20214.376ZM159%20260.415L160.5%20260.415V260.415H159ZM0%20260.415H-1.5V260.415L0%20260.415ZM0%20214.376L-0.0158204%20212.876L-1.5%20212.892V214.376H0ZM11.7109%20203.58V202.08H10.308L10.2143%20203.48L11.7109%20203.58ZM159%2028.585H160.5V28.5849L159%2028.585ZM159%20191.257L158.984%20192.757L160.5%20192.773V191.257H159ZM158.869%20191.256L158.869%20189.756H158.869V191.256ZM147.003%20202.58V204.08H148.472L148.503%20202.611L147.003%20202.58ZM11.7344%20202.58L10.2347%20202.611L10.265%20204.08H11.7344V202.58ZM0%20191.257H-1.5V192.741L-0.0158191%20192.757L0%20191.257ZM0%2028.585L-1.5%2028.5849V28.585H0ZM147.026%20203.58L145.53%20203.68C145.988%20210.525%20151.816%20215.878%20158.869%20215.878V214.378V212.878C153.339%20212.878%20148.872%20208.693%20148.523%20203.48L147.026%20203.58ZM158.869%20214.378L158.869%20215.878C158.907%20215.878%20158.941%20215.877%20158.964%20215.877C158.992%20215.876%20159.003%20215.876%20159.016%20215.876L159%20214.376L158.984%20212.876C158.877%20212.877%20158.918%20212.878%20158.869%20212.878L158.869%20214.378ZM159%20214.376H157.5V260.415H159H160.5V214.376H159ZM159%20260.415L157.5%20260.415C157.5%20268.157%20151.045%20274.5%20143%20274.5V276V277.5C152.628%20277.5%20160.5%20269.888%20160.5%20260.415L159%20260.415ZM143%20276V274.5H16V276V277.5H143V276ZM16%20276V274.5C7.95456%20274.5%201.50011%20268.157%201.5%20260.415L0%20260.415L-1.5%20260.415C-1.49986%20269.888%206.37249%20277.5%2016%20277.5V276ZM0%20260.415H1.5V214.376H0H-1.5V260.415H0ZM0%20214.376L0.0158204%20215.876C7.00229%20215.802%2012.7527%20210.477%2013.2076%20203.68L11.7109%20203.58L10.2143%20203.48C9.86783%20208.657%205.46147%20212.818%20-0.0158204%20212.876L0%20214.376ZM11.7109%20203.58V205.08H147.026V203.58V202.08H11.7109V203.58ZM143%2013V14.5C151.045%2014.5%20157.5%2020.8429%20157.5%2028.585L159%2028.585L160.5%2028.5849C160.5%2019.1123%20152.628%2011.5%20143%2011.5V13ZM159%2028.585H157.5V191.257H159H160.5V28.585H159ZM159%20191.257L159.016%20189.757C158.976%20189.757%20158.923%20189.756%20158.869%20189.756L158.869%20191.256L158.869%20192.756C158.903%20192.756%20158.937%20192.756%20158.984%20192.757L159%20191.257ZM158.869%20191.256V189.756C151.614%20189.756%20145.65%20195.423%20145.503%20202.549L147.003%20202.58L148.503%20202.611C148.615%20197.186%20153.177%20192.756%20158.869%20192.756V191.256ZM147.003%20202.58V201.08H11.7344V202.58V204.08H147.003V202.58ZM11.7344%20202.58L13.2341%20202.549C13.088%20195.471%207.2047%20189.833%200.0158191%20189.757L0%20191.257L-0.0158191%20192.757C5.62232%20192.816%2010.1235%20197.222%2010.2347%20202.611L11.7344%20202.58ZM0%20191.257H1.5V28.585H0H-1.5V191.257H0ZM0%2028.585L1.5%2028.585C1.50011%2020.8429%207.95456%2014.5%2016%2014.5V13V11.5C6.37249%2011.5%20-1.49986%2019.1123%20-1.5%2028.5849L0%2028.585ZM16%2013V14.5H143V13V11.5H16V13Z%22%20fill%3D%22%23C2D9FF%22%20mask%3D%22url(%23path-1-inside-1_1086_24421)%22%2F%3E%0A%3Crect%20x%3D%2215%22%20y%3D%2226.5%22%20width%3D%2239%22%20height%3D%2217%22%20rx%3D%228.5%22%20fill%3D%22%23E7F0FF%22%2F%3E%0A%3Cpath%20d%3D%22M26.444%2038.564C27.084%2038.564%2027.652%2038.424%2028.148%2038.144C28.644%2037.856%2029.028%2037.456%2029.3%2036.944C29.58%2036.424%2029.72%2035.832%2029.72%2035.168C29.72%2034.504%2029.58%2033.916%2029.3%2033.404C29.028%2032.884%2028.644%2032.484%2028.148%2032.204C27.652%2031.916%2027.084%2031.772%2026.444%2031.772L25.136%2031.784V38.552L26.444%2038.564ZM26.456%2030.776C27.304%2030.776%2028.06%2030.964%2028.724%2031.34C29.388%2031.708%2029.904%2032.228%2030.272%2032.9C30.648%2033.564%2030.836%2034.32%2030.836%2035.168C30.836%2036.016%2030.648%2036.776%2030.272%2037.448C29.904%2038.112%2029.388%2038.632%2028.724%2039.008C28.06%2039.376%2027.304%2039.56%2026.456%2039.56H24.008V30.776H26.456ZM37.7065%2034.52V35.648H32.5345V34.52H37.7065ZM39.9436%2039.536L43.3876%2031.784L39.3076%2031.796V30.788H44.5036L44.6236%2031.784L41.1796%2039.536H39.9436Z%22%20fill%3D%22%23003486%22%2F%3E%0A%3Cpath%20d%3D%22M141.894%2029.7657C141.554%2029.4038%20141.149%2029.1166%20140.704%2028.9208C140.259%2028.7249%20139.782%2028.624%20139.301%2028.624C138.819%2028.624%20138.342%2028.7249%20137.897%2028.9208C137.452%2029.1166%20137.048%2029.4038%20136.707%2029.7657L136.001%2030.5166L135.294%2029.7657C134.606%2029.035%20133.673%2028.6244%20132.701%2028.6244C131.728%2028.6244%20130.795%2029.035%20130.107%2029.7657C129.42%2030.4965%20129.033%2031.4877%20129.033%2032.5211C129.033%2033.5546%20129.42%2034.5458%20130.107%2035.2766L136.001%2041.5382L141.894%2035.2766C142.235%2034.9148%20142.505%2034.4852%20142.689%2034.0124C142.874%2033.5397%20142.969%2033.0329%20142.969%2032.5211C142.969%2032.0094%20142.874%2031.5026%20142.689%2031.0299C142.505%2030.5571%20142.235%2030.1275%20141.894%2029.7657Z%22%20stroke%3D%22%23003486%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M102.582%2059.1208C107.69%2063.9227%20111.037%2069.5266%20112.953%2076.2682C112.998%2076.4268%20113.043%2076.5853%20113.089%2076.7487C113.812%2079.4647%20114.011%2082.1641%20113.999%2084.9665C113.999%2085.2079%20113.999%2085.2079%20113.998%2085.4541C113.987%2087.8665%20113.836%2090.099%20113.218%2092.4412C113.139%2092.7924%20113.061%2093.1438%20112.983%2093.4953C111.681%2099.1547%20108.897%20104.232%20104.962%20108.481C104.844%20108.609%20104.727%20108.737%20104.606%20108.869C102.712%20110.906%20100.661%20112.59%2098.3573%20114.143C98.1021%20114.315%2097.847%20114.488%2097.5842%20114.665C90.4879%20119.235%2081.5375%20120.943%2073.2796%20119.273C72.3568%20119.071%2071.4393%20118.853%2070.5226%20118.625C70.2335%20118.557%2069.9443%20118.489%2069.6464%20118.419C66.1227%20117.471%2062.5816%20115.623%2059.6719%20113.435C59.4757%20113.288%2059.2796%20113.141%2059.0775%20112.99C51.1738%20106.854%2046.6339%2098.4723%2045.1722%2088.6302C45.1051%2088.0117%2045.0683%2087.4016%2045.0469%2086.7799C45.0347%2086.512%2045.0226%2086.2442%2045.01%2085.9681C44.7765%2076.3253%2048.6338%2067.5426%2055.19%2060.5965C55.3369%2060.4372%2055.4837%2060.2778%2055.6351%2060.1137C60.6724%2054.8334%2067.8528%2051.5489%2075.0045%2050.4534C75.1942%2050.4227%2075.384%2050.392%2075.5795%2050.3603C85.3336%2049.0903%2095.3733%2052.5323%20102.582%2059.1208Z%22%20fill%3D%22%23FCFCFC%22%2F%3E%0A%3Cpath%20d%3D%22M88.7478%2063.3556C90.628%2065.1094%2091.4836%2067.3683%2091.5904%2069.8996C91.5245%2071.8929%2090.9502%2073.505%2089.5503%2074.9481C86.0902%2077.7538%2081.2196%2078.6563%2076.9977%2079.6797C75.8474%2079.9602%2074.718%2080.2898%2073.5893%2080.6472C73.9856%2082.4153%2074.3489%2083.8518%2075.9482%2084.8931C77.6158%2085.6873%2079.5292%2085.5884%2081.2409%2084.9816C82.2696%2084.5169%2082.7701%2084.0484%2083.2606%2083.0061C83.4163%2082.4612%2083.572%2081.9163%2083.7324%2081.3548C86.2234%2081.3548%2088.7143%2081.3548%2091.2808%2081.3548C90.9491%2084.0085%2089.9946%2085.9519%2087.9434%2087.6786C86.4262%2088.8202%2084.8229%2089.4977%2083.0248%2090.0827C82.8511%2090.141%2082.6775%2090.1994%2082.4986%2090.2596C79.3288%2091.1425%2075.5369%2090.6985%2072.6227%2089.2469C69.6224%2087.4434%2067.8991%2085.1254%2067.0287%2081.7234C66.9307%2081.2871%2066.837%2080.8497%2066.7486%2080.4113C66.708%2080.2353%2066.6674%2080.0594%2066.6256%2079.8781C66.3934%2078.549%2066.4551%2077.187%2066.4537%2075.841C66.4535%2075.6813%2066.4532%2075.5216%2066.453%2075.3571C66.4553%2073.0364%2066.5276%2070.8512%2067.2203%2068.617C67.3148%2068.2954%2067.3148%2068.2954%2067.4111%2067.9674C68.31%2065.3504%2070.3012%2063.3211%2072.6725%2061.9624C77.6736%2059.5304%2084.2846%2060.0101%2088.7478%2063.3556Z%22%20fill%3D%22%23FCB508%22%2F%3E%0A%3Cpath%20d%3D%22M83.0239%2066.2574C84.053%2067.1758%2084.6281%2067.9939%2084.734%2069.3976C84.6479%2070.6674%2084.2664%2071.3601%2083.4072%2072.2872C81.1325%2074.0096%2076.1788%2075.6928%2073.3525%2075.6928C73.3316%2074.8771%2073.3193%2074.0614%2073.3083%2073.2455C73.3023%2073.0178%2073.2964%2072.79%2073.2903%2072.5554C73.2719%2070.7253%2073.4473%2068.852%2074.5909%2067.3484C76.7479%2065.2894%2080.3666%2064.7502%2083.0239%2066.2574Z%22%20fill%3D%22%23FDFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M75.477%2095.0363C75.7105%2094.8806%2075.9441%2094.725%2076.1847%2094.5645C77.3598%2094.4155%2078.6713%2094.2815%2079.7589%2094.8124C80.2548%2095.2235%2080.6139%2095.6388%2080.9024%2096.2158C80.9228%2096.801%2080.9297%2097.3795%2080.9254%2097.9646C80.9251%2098.1367%2080.9248%2098.3089%2080.9244%2098.4862C80.9231%2099.0366%2080.9201%2099.587%2080.9171%20100.137C80.916%20100.51%2080.9149%20100.883%2080.9139%20101.256C80.9113%20102.171%2080.9072%20103.085%2080.9024%20104C80.2018%20104%2079.5012%20104%2078.7794%20104C78.776%20103.788%2078.7725%20103.576%2078.769%20103.358C78.7546%20102.573%2078.7371%20101.788%2078.7175%20101.002C78.7097%20100.662%2078.703%20100.322%2078.6977%2099.9825C78.6898%2099.494%2078.6775%2099.0058%2078.6642%2098.5175C78.6581%2098.2235%2078.6519%2097.9295%2078.6455%2097.6266C78.595%2097.2785%2078.595%2097.2785%2078.5435%2096.9234C77.8746%2096.372%2077.8746%2096.372%2077.0987%2096.5106C76.8749%2096.569%2076.6511%2096.6274%2076.4205%2096.6875C76.0913%2097.3459%2076.1332%2097.9146%2076.11%2098.6502C76.1001%2098.9467%2076.0903%2099.2431%2076.0801%2099.5486C76.0708%2099.8596%2076.0615%20100.171%2076.052%20100.491C76.0418%20100.807%2076.0315%20101.123%2076.0211%20101.439C75.996%20102.214%2075.972%20102.989%2075.9488%20103.764C75.2482%20103.764%2074.5476%20103.764%2073.8258%20103.764C73.8224%20103.559%2073.8189%20103.355%2073.8154%20103.144C73.801%20102.385%2073.7835%20101.626%2073.7639%20100.867C73.756%20100.539%2073.7494%20100.21%2073.7441%2099.8817C73.7362%2099.4097%2073.7235%2098.9378%2073.7106%2098.4659C73.7044%2098.1818%2073.6983%2097.8977%2073.6919%2097.6049C73.6582%2097.38%2073.6246%2097.1551%2073.5899%2096.9234C72.9206%2096.369%2072.9206%2096.369%2072.1451%2096.5254C71.495%2096.6183%2071.495%2096.6183%2071.231%2096.9234C71.1936%2097.4291%2071.1718%2097.936%2071.1564%2098.4429C71.1465%2098.7507%2071.1366%2099.0586%2071.1265%2099.3758C71.1171%2099.7034%2071.1077%20100.031%2071.0984%20100.359C71.0882%20100.687%2071.0779%20101.015%2071.0675%20101.344C71.0424%20102.151%2071.0183%20102.957%2070.9952%20103.764C70.2946%20103.764%2069.594%20103.764%2068.8722%20103.764C68.8429%20102.749%2068.8216%20101.733%2068.8074%20100.718C68.8015%20100.373%2068.7934%20100.028%2068.7832%2099.6826C68.7688%2099.1848%2068.7622%2098.6874%2068.757%2098.1895C68.7508%2097.8905%2068.7446%2097.5916%2068.7383%2097.2836C68.9154%2096.183%2069.2706%2095.8181%2070.0516%2095.0363C71.7038%2094.1164%2073.7724%2094.4244%2075.477%2095.0363Z%22%20fill%3D%22%2329374A%22%2F%3E%0A%3Cpath%20d%3D%22M66.7479%2095.0364C67.4718%2095.6547%2067.8576%2096.0896%2068.0398%2097.035C68.1039%2098.1812%2068.1039%2098.1812%2067.9274%2098.8106C67.0516%2099.741%2066.1992%2099.9461%2064.964%20100.167C64.8085%20100.196%2064.653%20100.226%2064.4927%20100.256C63.7322%20100.395%2063.0424%20100.462%2062.2661%20100.462C62.408%20100.938%2062.5664%20101.41%2062.7378%20101.877C63.4671%20102.242%2064.0575%20102.182%2064.8608%20102.113C65.0068%20101.957%2065.1527%20101.802%2065.3031%20101.641C65.9113%20101.069%2066.1134%20101.105%2066.9248%20101.11C67.2592%20101.126%2067.5936%20101.144%2067.9274%20101.169C67.6264%20102.346%2067.1994%20102.976%2066.2761%20103.764C64.9924%20104.192%2063.2923%20104.3%2062.0108%20103.814C61.6469%20103.573%2061.6469%20103.573%2061.0866%20103.057C60.9456%20102.935%2060.8045%20102.813%2060.6591%20102.688C59.9286%20101.804%2060.0997%20100.642%2060.0989%2099.5624C60.096%2099.375%2060.0931%2099.1875%2060.0901%2098.9944C60.0874%2097.9008%2060.1597%2096.9956%2060.6149%2095.9799C62.4425%2094.1929%2064.4724%2093.7844%2066.7479%2095.0364Z%22%20fill%3D%22%232C3A4D%22%2F%3E%0A%3Cpath%20d%3D%22M87.8399%2094.742C88.645%2095.1779%2089.0688%2095.6105%2089.3944%2096.4513C89.5057%2097.3822%2089.4926%2098.3156%2089.4976%2099.2524C89.5053%2099.5063%2089.5131%2099.7602%2089.5211%20100.022C89.5353%20102.114%2089.5353%20102.114%2088.8719%20102.97C87.5032%20104.133%2086.266%20104.099%2084.5191%20104.077C83.241%20103.951%2082.737%20103.475%2081.846%20102.584C81.655%20101.336%2081.6167%20100.311%2082.362%2099.2672C83.4687%2098.5048%2084.4882%2098.2602%2085.8118%2098.073C86.0858%2098.0335%2086.3598%2097.994%2086.6421%2097.9532C86.9536%2097.9104%2086.9536%2097.9104%2087.2714%2097.8666C87.1157%2097.3996%2086.96%2096.9325%2086.7996%2096.4513C86.0844%2096.3973%2085.3899%2096.3641%2084.6766%2096.4513C84.4346%2096.7611%2084.1984%2097.0756%2083.969%2097.3948C83.3205%2097.4834%2082.7402%2097.438%2082.0819%2097.3948C82.1688%2095.8888%2082.1688%2095.8888%2082.8928%2095.1834C84.3209%2094.2778%2086.2247%2094.2368%2087.8399%2094.742Z%22%20fill%3D%22%232D3C4E%22%2F%3E%0A%3Cpath%20d%3D%22M96.2492%2092.418C97.067%2092.4295%2097.067%2092.4295%2097.8848%2092.441C97.8848%2093.1416%2097.8848%2093.8422%2097.8848%2094.564C98.4297%2094.564%2098.9746%2094.564%2099.536%2094.564C99.536%2095.1089%2099.536%2095.6538%2099.536%2096.2152C98.9911%2096.2152%2098.4462%2096.2152%2097.8848%2096.2152C97.9626%2098.0834%2098.0405%2099.9516%2098.1207%20101.876C98.6656%20101.954%2099.2105%20102.032%2099.7719%20102.112C99.7719%20102.735%2099.7719%20103.358%2099.7719%20103.999C97.1961%20104.184%2097.1961%20104.184%2096.1894%20103.454C95.4295%20102.327%2095.4915%20101.299%2095.4946%2099.9875C95.4943%2099.6757%2095.4943%2099.6757%2095.4939%2099.3576C95.4937%2098.9186%2095.4942%2098.4797%2095.4952%2098.0407C95.4964%2097.3661%2095.4952%2096.6916%2095.4937%2096.0171C95.4938%2095.5911%2095.4941%2095.1651%2095.4946%2094.7391C95.4941%2094.5361%2095.4936%2094.3332%2095.4931%2094.1241C95.4998%2092.4534%2095.4998%2092.4534%2096.2492%2092.418Z%22%20fill%3D%22%23323E50%22%2F%3E%0A%3Cpath%20d%3D%22M94.0514%2094.5497C94.2399%2094.5518%2094.4285%2094.554%2094.6227%2094.5562C94.765%2094.5589%2094.9073%2094.5616%2095.0539%2094.5645C95.0539%2095.1872%2095.0539%2095.8099%2095.0539%2096.4515C94.3398%2096.5091%2094.3398%2096.5091%2093.6257%2096.5667C93.0736%2096.6577%2093.0736%2096.6577%2092.6951%2097.3951C92.6081%2098.0807%2092.6081%2098.0807%2092.5974%2098.8574C92.5837%2099.285%2092.5837%2099.285%2092.5697%2099.7212C92.5588%20100.168%2092.5588%20100.168%2092.5476%20100.624C92.534%20101.075%2092.534%20101.075%2092.52%20101.535C92.4977%20102.278%2092.4775%20103.021%2092.4592%20103.764C91.7586%20103.764%2091.058%20103.764%2090.3362%20103.764C90.3186%20102.778%2090.3058%20101.792%2090.2973%20100.805C90.2938%20100.47%2090.289%20100.135%2090.2828%2099.7999C90.2742%2099.3167%2090.2702%2098.8338%2090.2671%2098.3506C90.2634%2098.0603%2090.2597%2097.77%2090.2559%2097.4709C90.3642%2096.4147%2090.7195%2095.801%2091.5009%2095.0952C92.3325%2094.5912%2093.0916%2094.5356%2094.0514%2094.5497Z%22%20fill%3D%22%23283648%22%2F%3E%0A%3Cpath%20d%3D%22M85.7233%2096.1713C86.0074%2096.1663%2086.0074%2096.1663%2086.2973%2096.1611C86.7995%2096.2155%2086.7995%2096.2155%2087.2713%2096.6873C87.3008%2097.3065%2087.3008%2097.3065%2087.2713%2097.8667C86.4434%2098.2281%2085.6866%2098.4281%2084.7945%2098.5596C83.8327%2098.7242%2083.0966%2098.8947%2082.3177%2099.5179C82.0099%20100.133%2082.0505%20100.6%2082.0523%20101.287C82.0517%20101.518%2082.0511%20101.749%2082.0504%20101.987C82.0418%20102.583%2082.0418%20102.583%2082.3177%20103.056C81.8506%20103.368%2081.3836%20103.679%2080.9023%20104C80.9023%20101.587%2080.9023%2099.1735%2080.9023%2096.6873C81.2916%2096.6094%2081.6808%2096.5316%2082.0818%2096.4514C82.0818%2096.7628%2082.0818%2097.0741%2082.0818%2097.3949C82.7045%2097.3949%2083.3273%2097.3949%2083.9689%2097.3949C84.0418%2097.2441%2084.1148%2097.0933%2084.19%2096.9379C84.6072%2096.1281%2084.8336%2096.1784%2085.7233%2096.1713Z%22%20fill%3D%22%23EAEBEC%22%2F%3E%0A%3Cpath%20d%3D%22M87.5074%2099.5176C87.6498%20101.227%2087.6498%20101.227%2087.0357%20101.994C86.0782%20102.473%2085.5047%20102.453%2084.4409%20102.348C83.9691%20101.876%2083.9691%20101.876%2083.9102%20101.169C83.9691%20100.461%2083.9691%20100.461%2084.4409%2099.9894C84.9781%2099.8401%2084.9781%2099.8401%2085.6056%2099.724C85.8121%2099.6844%2086.0185%2099.6449%2086.2312%2099.6042C86.7998%2099.5176%2086.7998%2099.5176%2087.5074%2099.5176Z%22%20fill%3D%22%23F4F4F5%22%2F%3E%0A%3Cpath%20d%3D%22M64.5889%2096.1131C65.2103%2096.238%2065.4256%2096.4225%2065.8052%2096.923C65.8789%2097.5275%2065.8789%2097.5275%2065.8052%2098.1024C65.1517%2098.7559%2064.6811%2098.6681%2063.7707%2098.7216C63.4903%2098.7393%2063.21%2098.7569%2062.9211%2098.7751C62.7052%2098.7866%2062.4893%2098.7982%2062.2669%2098.8101C62.2202%2098.0007%2062.1947%2097.3466%2062.488%2096.5839C63.1746%2096.0638%2063.7466%2096.1117%2064.5889%2096.1131Z%22%20fill%3D%22%23F3F3F4%22%2F%3E%0A%3Cpath%20d%3D%22M67.9282%20101.169C67.6273%20102.345%2067.2003%20102.975%2066.277%20103.763C65.5341%20104.011%2065.006%20104.023%2064.2278%20104.014C63.9933%20104.012%2063.7589%20104.01%2063.5173%20104.008C63.2487%20104.004%2063.2487%20104.004%2062.9746%20103.999C62.9746%20103.922%2062.9746%20103.844%2062.9746%20103.763C63.5974%20103.763%2064.2201%20103.763%2064.8617%20103.763C65.0225%20103.317%2065.0225%20103.317%2065.0976%20102.82C64.9419%20102.664%2064.7862%20102.509%2064.6258%20102.348C65.6297%20101.053%2066.3984%20101.019%2067.9282%20101.169Z%22%20fill%3D%22%23253144%22%2F%3E%0A%3Cpath%20d%3D%22M87.0348%2098.1025C87.0348%2098.4139%2087.0348%2098.7253%2087.0348%2099.0461C87.1905%2099.1239%2087.3462%2099.2018%2087.5066%2099.282C86.6648%2099.8432%2085.983%2099.9291%2085.0003%20100.093C84.382%20100.205%2084.382%20100.205%2083.7324%20100.697C83.969%20100.169%2084.1676%2099.789%2084.5875%2099.3852C84.9934%2099.0391%2084.9934%2099.0391%2084.9119%2098.3384C85.6557%2098.1731%2086.2628%2098.1025%2087.0348%2098.1025Z%22%20fill%3D%22%23243245%22%2F%3E%0A%3Cpath%20d%3D%22M84.6755%2098.5745C84.2038%2099.2821%2084.2038%2099.2821%2083.3782%2099.5475C82.5299%2099.8894%2082.5299%2099.8894%2082.3397%20100.507C82.2248%20101.042%2082.1368%20101.568%2082.0808%20102.113C82.0029%20102.113%2081.9251%20102.113%2081.8449%20102.113C81.6597%20100.224%2081.6597%20100.224%2082.4051%2099.2821C83.2456%2098.6417%2083.6337%2098.547%2084.6755%2098.5745Z%22%20fill%3D%22%23273444%22%2F%3E%0A%3Cpath%20d%3D%22M83.7317%2081.5908C84.6658%2081.5908%2085.5999%2081.5908%2086.5624%2081.5908C86.5624%2081.6687%2086.5624%2081.7465%2086.5624%2081.8267C85.7061%2081.8267%2084.8498%2081.8267%2083.9676%2081.8267C83.9482%2082.1186%2083.9287%2082.4105%2083.9086%2082.7113C83.8179%2083.4753%2083.7553%2083.6853%2083.2452%2084.3035C83.0944%2084.4203%2082.9436%2084.537%2082.7882%2084.6573C82.6325%2084.5795%2082.4768%2084.5017%2082.3164%2084.4215C82.4624%2084.2171%2082.6083%2084.0128%2082.7587%2083.8023C83.2238%2083.0636%2083.4934%2082.425%2083.7317%2081.5908Z%22%20fill%3D%22%23F9A70B%22%2F%3E%0A%3Cpath%20d%3D%22M65.8048%2098.574C65.8048%2098.7297%2065.8048%2098.8854%2065.8048%2099.0458C64.7067%2099.2435%2063.8303%2099.2855%2062.7383%2099.0458C62.7383%2098.9679%2062.7383%2098.8901%2062.7383%2098.8099C63.1605%2098.7245%2063.5833%2098.6414%2064.0062%2098.5593C64.3592%2098.4895%2064.3592%2098.4895%2064.7194%2098.4183C65.333%2098.3381%2065.333%2098.3381%2065.8048%2098.574Z%22%20fill%3D%22%23222D41%22%2F%3E%0A%3Cpath%20d%3D%22M68.1642%2066.2578C68.2421%2066.2578%2068.3199%2066.2578%2068.4001%2066.2578C68.5091%2067.4201%2068.1236%2068.2646%2067.6925%2069.3243C67.5368%2069.2465%2067.3811%2069.1687%2067.2207%2069.0885C67.3332%2068.705%2067.4464%2068.3217%2067.5598%2067.9385C67.6227%2067.725%2067.6857%2067.5116%2067.7505%2067.2917C67.9284%2066.7296%2067.9284%2066.7296%2068.1642%2066.2578Z%22%20fill%3D%22%23FBB525%22%2F%3E%0A%3Cpath%20d%3D%22M86.7988%2099.5176C87.0323%2099.5176%2087.2659%2099.5176%2087.5065%2099.5176C87.5065%20100.14%2087.5065%20100.763%2087.5065%20101.405C87.2729%20101.249%2087.0394%20101.093%2086.7988%20100.933C86.7546%20100.196%2086.7546%20100.196%2086.7988%2099.5176Z%22%20fill%3D%22%23CACED3%22%2F%3E%0A%3Cpath%20d%3D%22M82.3167%2099.2822C82.5502%2099.3601%2082.7837%2099.4379%2083.0243%2099.5181C82.8565%2099.7006%2082.8565%2099.7006%2082.6852%2099.8867C82.2157%20100.619%2082.1632%20101.256%2082.0808%20102.113C82.0029%20102.113%2081.9251%20102.113%2081.8449%20102.113C81.8321%20101.774%2081.823%20101.435%2081.8154%20101.096C81.8099%20100.907%2081.8045%20100.718%2081.7988%20100.523C81.8449%2099.9899%2081.8449%2099.9899%2082.3167%2099.2822Z%22%20fill%3D%22%231B2432%22%2F%3E%0A%3Cpath%20d%3D%22M88.9221%2074.2783C89.1556%2074.434%2089.3891%2074.5897%2089.6297%2074.7501C89.2405%2075.0615%2088.8513%2075.3728%2088.4503%2075.6936C88.2946%2075.6158%2088.1389%2075.538%2087.9785%2075.4578C87.9785%2075.3021%2087.9785%2075.1464%2087.9785%2074.986C88.212%2074.8303%2088.4456%2074.6746%2088.6862%2074.5142C88.764%2074.4364%2088.8419%2074.3585%2088.9221%2074.2783Z%22%20fill%3D%22%23F7A811%22%2F%3E%0A%3Cpath%20d%3D%22M27.208%20128.072V142.264H25.624V128.072H27.208ZM19.688%20129.128C20.392%20129.128%2021.016%20129.336%2021.56%20129.752C22.1147%20130.157%2022.5467%20130.739%2022.856%20131.496C23.1653%20132.243%2023.32%20133.112%2023.32%20134.104C23.32%20135.107%2023.1653%20135.987%2022.856%20136.744C22.5467%20137.501%2022.1147%20138.088%2021.56%20138.504C21.016%20138.909%2020.392%20139.112%2019.688%20139.112C18.984%20139.112%2018.3547%20138.909%2017.8%20138.504C17.2453%20138.088%2016.8133%20137.501%2016.504%20136.744C16.1947%20135.987%2016.04%20135.107%2016.04%20134.104C16.04%20133.112%2016.1947%20132.243%2016.504%20131.496C16.8133%20130.739%2017.2453%20130.157%2017.8%20129.752C18.3547%20129.336%2018.984%20129.128%2019.688%20129.128ZM19.688%20130.552C19.048%20130.552%2018.5307%20130.872%2018.136%20131.512C17.752%20132.152%2017.56%20133.016%2017.56%20134.104C17.56%20135.203%2017.752%20136.077%2018.136%20136.728C18.5307%20137.368%2019.048%20137.688%2019.688%20137.688C20.3173%20137.688%2020.8293%20137.368%2021.224%20136.728C21.6187%20136.077%2021.816%20135.203%2021.816%20134.104C21.816%20133.016%2021.6187%20132.152%2021.224%20131.512C20.8293%20130.872%2020.3173%20130.552%2019.688%20130.552ZM36.6804%20129.464V138.712H30.0884V129.464H36.6804ZM31.6244%20130.728V137.448H35.1444V130.728H31.6244ZM40.5364%20128.088V133.624H42.7444V134.936H40.5364V142.248H38.9524V128.088H40.5364ZM54.8088%20129.224V130.488H46.7288V132.36H54.5048V133.608H46.7288V135.576H54.9528V136.84H45.1448V129.224H54.8088ZM56.3768%20139.208V140.488H43.5448V139.208H56.3768Z%22%20fill%3D%22%231D2939%22%2F%3E%0A%3Cpath%20d%3D%22M23.92%20156.853C24.5733%20157.226%2025.1067%20157.74%2025.52%20158.393C25.9333%20159.033%2026.14%20159.666%2026.14%20160.293C26.14%20161.106%2025.92%20161.84%2025.48%20162.493C25.0533%20163.133%2024.4467%20163.633%2023.66%20163.993C22.8867%20164.353%2022.0067%20164.533%2021.02%20164.533C20.0333%20164.533%2019.1467%20164.346%2018.36%20163.973C17.5867%20163.586%2016.98%20163.06%2016.54%20162.393C16.1133%20161.713%2015.9%20160.94%2015.9%20160.073H18.48C18.48%20160.713%2018.7133%20161.24%2019.18%20161.653C19.66%20162.053%2020.2733%20162.253%2021.02%20162.253C21.7933%20162.253%2022.4267%20162.053%2022.92%20161.653C23.4133%20161.24%2023.66%20160.713%2023.66%20160.073C23.66%20159.446%2023.4133%20158.933%2022.92%20158.533C22.44%20158.12%2021.82%20157.913%2021.06%20157.913H20.04V155.813H21.08C21.7733%20155.813%2022.34%20155.633%2022.78%20155.273C23.22%20154.9%2023.44%20154.426%2023.44%20153.853C23.44%20153.293%2023.2267%20152.84%2022.8%20152.493C22.3733%20152.133%2021.8267%20151.953%2021.16%20151.953C20.5067%20151.953%2019.9733%20152.133%2019.56%20152.493C19.1467%20152.853%2018.94%20153.313%2018.94%20153.873H16.36C16.36%20153.06%2016.56%20152.333%2016.96%20151.693C17.3733%20151.053%2017.94%20150.56%2018.66%20150.213C19.3933%20149.853%2020.2267%20149.673%2021.16%20149.673C22.08%20149.673%2022.9%20149.846%2023.62%20150.193C24.34%20150.526%2024.9%20150.993%2025.3%20151.593C25.7%20152.193%2025.9%20152.88%2025.9%20153.653C25.9%20154.226%2025.7133%20154.813%2025.34%20155.413C24.98%20156.013%2024.5067%20156.493%2023.92%20156.853ZM29.7117%20167.473H27.8117L28.6517%20162.273H31.2717L29.7117%20167.473ZM40.1836%20162.293C40.8103%20162.293%2041.3569%20162.08%2041.8236%20161.653C42.2903%20161.226%2042.6503%20160.62%2042.9036%20159.833C43.1569%20159.046%2043.2836%20158.133%2043.2836%20157.093C43.2836%20156.053%2043.1569%20155.14%2042.9036%20154.353C42.6503%20153.566%2042.2903%20152.96%2041.8236%20152.533C41.3569%20152.106%2040.8103%20151.893%2040.1836%20151.893C39.5569%20151.893%2039.0036%20152.106%2038.5236%20152.533C38.0569%20152.96%2037.6903%20153.566%2037.4236%20154.353C37.1703%20155.14%2037.0436%20156.053%2037.0436%20157.093C37.0436%20158.133%2037.1703%20159.046%2037.4236%20159.833C37.6903%20160.62%2038.0569%20161.226%2038.5236%20161.653C39.0036%20162.08%2039.5569%20162.293%2040.1836%20162.293ZM40.1836%20164.553C39.0769%20164.553%2038.0903%20164.24%2037.2236%20163.613C36.3569%20162.973%2035.6769%20162.086%2035.1836%20160.953C34.7036%20159.82%2034.4636%20158.533%2034.4636%20157.093C34.4636%20155.653%2034.7036%20154.366%2035.1836%20153.233C35.6769%20152.1%2036.3569%20151.22%2037.2236%20150.593C38.0903%20149.953%2039.0769%20149.633%2040.1836%20149.633C41.2769%20149.633%2042.2569%20149.953%2043.1236%20150.593C43.9903%20151.22%2044.6636%20152.1%2045.1436%20153.233C45.6236%20154.366%2045.8636%20155.653%2045.8636%20157.093C45.8636%20158.533%2045.6236%20159.82%2045.1436%20160.953C44.6636%20162.086%2043.9903%20162.973%2043.1236%20163.613C42.2569%20164.24%2041.2769%20164.553%2040.1836%20164.553ZM53.5477%20162.293C54.1743%20162.293%2054.721%20162.08%2055.1877%20161.653C55.6543%20161.226%2056.0143%20160.62%2056.2677%20159.833C56.521%20159.046%2056.6477%20158.133%2056.6477%20157.093C56.6477%20156.053%2056.521%20155.14%2056.2677%20154.353C56.0143%20153.566%2055.6543%20152.96%2055.1877%20152.533C54.721%20152.106%2054.1743%20151.893%2053.5477%20151.893C52.921%20151.893%2052.3677%20152.106%2051.8877%20152.533C51.421%20152.96%2051.0543%20153.566%2050.7877%20154.353C50.5343%20155.14%2050.4077%20156.053%2050.4077%20157.093C50.4077%20158.133%2050.5343%20159.046%2050.7877%20159.833C51.0543%20160.62%2051.421%20161.226%2051.8877%20161.653C52.3677%20162.08%2052.921%20162.293%2053.5477%20162.293ZM53.5477%20164.553C52.441%20164.553%2051.4543%20164.24%2050.5877%20163.613C49.721%20162.973%2049.041%20162.086%2048.5477%20160.953C48.0677%20159.82%2047.8277%20158.533%2047.8277%20157.093C47.8277%20155.653%2048.0677%20154.366%2048.5477%20153.233C49.041%20152.1%2049.721%20151.22%2050.5877%20150.593C51.4543%20149.953%2052.441%20149.633%2053.5477%20149.633C54.641%20149.633%2055.621%20149.953%2056.4877%20150.593C57.3543%20151.22%2058.0277%20152.1%2058.5077%20153.233C58.9877%20154.366%2059.2277%20155.653%2059.2277%20157.093C59.2277%20158.533%2058.9877%20159.82%2058.5077%20160.953C58.0277%20162.086%2057.3543%20162.973%2056.4877%20163.613C55.621%20164.24%2054.641%20164.553%2053.5477%20164.553ZM66.9117%20162.293C67.5384%20162.293%2068.0851%20162.08%2068.5517%20161.653C69.0184%20161.226%2069.3784%20160.62%2069.6317%20159.833C69.8851%20159.046%2070.0117%20158.133%2070.0117%20157.093C70.0117%20156.053%2069.8851%20155.14%2069.6317%20154.353C69.3784%20153.566%2069.0184%20152.96%2068.5517%20152.533C68.0851%20152.106%2067.5384%20151.893%2066.9117%20151.893C66.2851%20151.893%2065.7317%20152.106%2065.2517%20152.533C64.7851%20152.96%2064.4184%20153.566%2064.1517%20154.353C63.8984%20155.14%2063.7717%20156.053%2063.7717%20157.093C63.7717%20158.133%2063.8984%20159.046%2064.1517%20159.833C64.4184%20160.62%2064.7851%20161.226%2065.2517%20161.653C65.7317%20162.08%2066.2851%20162.293%2066.9117%20162.293ZM66.9117%20164.553C65.8051%20164.553%2064.8184%20164.24%2063.9517%20163.613C63.0851%20162.973%2062.4051%20162.086%2061.9117%20160.953C61.4317%20159.82%2061.1917%20158.533%2061.1917%20157.093C61.1917%20155.653%2061.4317%20154.366%2061.9117%20153.233C62.4051%20152.1%2063.0851%20151.22%2063.9517%20150.593C64.8184%20149.953%2065.8051%20149.633%2066.9117%20149.633C68.0051%20149.633%2068.9851%20149.953%2069.8517%20150.593C70.7184%20151.22%2071.3917%20152.1%2071.8717%20153.233C72.3517%20154.366%2072.5917%20155.653%2072.5917%20157.093C72.5917%20158.533%2072.3517%20159.82%2071.8717%20160.953C71.3917%20162.086%2070.7184%20162.973%2069.8517%20163.613C68.9851%20164.24%2068.0051%20164.553%2066.9117%20164.553ZM93.2652%20148.033V151.813H95.6252V153.973H93.2652V157.713H90.5852V148.033H93.2652ZM93.2652%20158.433V163.033H84.0052V163.973H93.7852V165.933H81.3852V161.233H90.6252V160.353H81.3452V158.433H93.2652ZM83.0452%20149.333V147.893H85.7052V149.333H89.6652V151.333H79.0852V149.333H83.0452ZM84.3852%20151.713C85.7185%20151.713%2086.7918%20151.98%2087.6052%20152.513C88.4185%20153.046%2088.8252%20153.766%2088.8252%20154.673C88.8252%20155.58%2088.4185%20156.293%2087.6052%20156.813C86.8052%20157.333%2085.7318%20157.593%2084.3852%20157.593C83.0385%20157.593%2081.9585%20157.333%2081.1452%20156.813C80.3452%20156.293%2079.9452%20155.58%2079.9452%20154.673C79.9452%20153.766%2080.3452%20153.046%2081.1452%20152.513C81.9585%20151.98%2083.0385%20151.713%2084.3852%20151.713ZM84.3852%20153.593C83.1318%20153.593%2082.5052%20153.953%2082.5052%20154.673C82.5052%20155.033%2082.6652%20155.3%2082.9852%20155.473C83.3185%20155.646%2083.7852%20155.733%2084.3852%20155.733C84.9718%20155.733%2085.4252%20155.646%2085.7452%20155.473C86.0785%20155.286%2086.2452%20155.02%2086.2452%20154.673C86.2452%20154.313%2086.0852%20154.046%2085.7652%20153.873C85.4452%20153.686%2084.9852%20153.593%2084.3852%20153.593ZM111.726%20148.053V160.953H109.066V148.053H111.726ZM102.366%20159.673V163.613H112.166V165.733H99.7056V159.673H102.366ZM101.906%20149.173C102.826%20149.173%20103.659%20149.373%20104.406%20149.773C105.152%20150.16%20105.739%20150.7%20106.166%20151.393C106.606%20152.086%20106.826%20152.873%20106.826%20153.753C106.826%20154.62%20106.606%20155.406%20106.166%20156.113C105.739%20156.806%20105.152%20157.353%20104.406%20157.753C103.659%20158.14%20102.826%20158.333%20101.906%20158.333C100.999%20158.333%20100.172%20158.133%2099.4256%20157.733C98.679%20157.333%2098.0856%20156.786%2097.6456%20156.093C97.219%20155.4%2097.0056%20154.62%2097.0056%20153.753C97.0056%20152.873%2097.219%20152.086%2097.6456%20151.393C98.0856%20150.7%2098.679%20150.16%2099.4256%20149.773C100.172%20149.373%20100.999%20149.173%20101.906%20149.173ZM101.906%20151.473C101.239%20151.473%20100.686%20151.68%20100.246%20152.093C99.819%20152.493%2099.6056%20153.046%2099.6056%20153.753C99.6056%20154.446%2099.819%20155%20100.246%20155.413C100.686%20155.813%20101.239%20156.013%20101.906%20156.013C102.572%20156.013%20103.126%20155.813%20103.566%20155.413C104.006%20155%20104.226%20154.446%20104.226%20153.753C104.226%20153.046%20104.006%20152.493%20103.566%20152.093C103.126%20151.68%20102.572%20151.473%20101.906%20151.473Z%22%20fill%3D%22%231D2939%22%2F%3E%0A%3Cpath%20d%3D%22M15.984%20178.563L16.272%20173.979H20.832V174.975H17.364L17.22%20177.291C17.652%20177.075%2018.084%20176.967%2018.516%20176.967C19.1%20176.967%2019.62%20177.091%2020.076%20177.339C20.54%20177.587%2020.9%20177.931%2021.156%20178.371C21.412%20178.811%2021.54%20179.311%2021.54%20179.871C21.54%20180.439%2021.412%20180.947%2021.156%20181.395C20.9%20181.843%2020.54%20182.191%2020.076%20182.439C19.62%20182.687%2019.1%20182.811%2018.516%20182.811C18.06%20182.811%2017.628%20182.715%2017.22%20182.523C16.82%20182.331%2016.48%20182.063%2016.2%20181.719C15.92%20181.375%2015.728%20180.987%2015.624%20180.555L16.728%20180.303C16.824%20180.727%2017.036%20181.075%2017.364%20181.347C17.7%20181.611%2018.084%20181.743%2018.516%20181.743C19.068%20181.743%2019.52%20181.567%2019.872%20181.215C20.224%20180.863%2020.4%20180.415%2020.4%20179.871C20.4%20179.335%2020.224%20178.895%2019.872%20178.551C19.52%20178.207%2019.068%20178.035%2018.516%20178.035C18.284%20178.035%2018.036%20178.099%2017.772%20178.227C17.516%20178.355%2017.3%20178.519%2017.124%20178.719L15.984%20178.563ZM25.9762%20181.767C26.3842%20181.767%2026.7442%20181.623%2027.0562%20181.335C27.3682%20181.047%2027.6122%20180.643%2027.7882%20180.123C27.9642%20179.603%2028.0522%20179.007%2028.0522%20178.335C28.0522%20177.663%2027.9642%20177.067%2027.7882%20176.547C27.6202%20176.027%2027.3762%20175.623%2027.0562%20175.335C26.7442%20175.047%2026.3842%20174.903%2025.9762%20174.903C25.5682%20174.903%2025.2042%20175.047%2024.8842%20175.335C24.5722%20175.623%2024.3282%20176.027%2024.1522%20176.547C23.9842%20177.067%2023.9002%20177.663%2023.9002%20178.335C23.9002%20179.007%2023.9882%20179.603%2024.1642%20180.123C24.3402%20180.643%2024.5842%20181.047%2024.8962%20181.335C25.2082%20181.623%2025.5682%20181.767%2025.9762%20181.767ZM25.9762%20182.775C25.3522%20182.775%2024.7962%20182.587%2024.3082%20182.211C23.8202%20181.835%2023.4402%20181.311%2023.1682%20180.639C22.8962%20179.959%2022.7602%20179.191%2022.7602%20178.335C22.7602%20177.479%2022.8962%20176.715%2023.1682%20176.043C23.4402%20175.363%2023.8202%20174.835%2024.3082%20174.459C24.7962%20174.083%2025.3522%20173.895%2025.9762%20173.895C26.6002%20173.895%2027.1562%20174.083%2027.6442%20174.459C28.1322%20174.835%2028.5122%20175.363%2028.7842%20176.043C29.0562%20176.715%2029.1922%20177.479%2029.1922%20178.335C29.1922%20179.191%2029.0562%20179.959%2028.7842%20180.639C28.5122%20181.311%2028.1322%20181.835%2027.6442%20182.211C27.1562%20182.587%2026.6002%20182.775%2025.9762%20182.775ZM31.0968%20184.203H30.2568L30.6768%20181.623H31.8648L31.0968%20184.203ZM37.0738%20181.767C37.4818%20181.767%2037.8418%20181.623%2038.1538%20181.335C38.4658%20181.047%2038.7098%20180.643%2038.8858%20180.123C39.0618%20179.603%2039.1498%20179.007%2039.1498%20178.335C39.1498%20177.663%2039.0618%20177.067%2038.8858%20176.547C38.7178%20176.027%2038.4738%20175.623%2038.1538%20175.335C37.8418%20175.047%2037.4818%20174.903%2037.0738%20174.903C36.6658%20174.903%2036.3018%20175.047%2035.9818%20175.335C35.6698%20175.623%2035.4258%20176.027%2035.2498%20176.547C35.0818%20177.067%2034.9978%20177.663%2034.9978%20178.335C34.9978%20179.007%2035.0858%20179.603%2035.2618%20180.123C35.4378%20180.643%2035.6818%20181.047%2035.9938%20181.335C36.3058%20181.623%2036.6658%20181.767%2037.0738%20181.767ZM37.0738%20182.775C36.4498%20182.775%2035.8938%20182.587%2035.4058%20182.211C34.9178%20181.835%2034.5378%20181.311%2034.2658%20180.639C33.9938%20179.959%2033.8578%20179.191%2033.8578%20178.335C33.8578%20177.479%2033.9938%20176.715%2034.2658%20176.043C34.5378%20175.363%2034.9178%20174.835%2035.4058%20174.459C35.8938%20174.083%2036.4498%20173.895%2037.0738%20173.895C37.6978%20173.895%2038.2538%20174.083%2038.7418%20174.459C39.2298%20174.835%2039.6098%20175.363%2039.8818%20176.043C40.1538%20176.715%2040.2898%20177.479%2040.2898%20178.335C40.2898%20179.191%2040.1538%20179.959%2039.8818%20180.639C39.6098%20181.311%2039.2298%20181.835%2038.7418%20182.211C38.2538%20182.587%2037.6978%20182.775%2037.0738%20182.775ZM44.7144%20181.767C45.1224%20181.767%2045.4824%20181.623%2045.7944%20181.335C46.1064%20181.047%2046.3504%20180.643%2046.5264%20180.123C46.7024%20179.603%2046.7904%20179.007%2046.7904%20178.335C46.7904%20177.663%2046.7024%20177.067%2046.5264%20176.547C46.3584%20176.027%2046.1144%20175.623%2045.7944%20175.335C45.4824%20175.047%2045.1224%20174.903%2044.7144%20174.903C44.3064%20174.903%2043.9424%20175.047%2043.6224%20175.335C43.3104%20175.623%2043.0664%20176.027%2042.8904%20176.547C42.7224%20177.067%2042.6384%20177.663%2042.6384%20178.335C42.6384%20179.007%2042.7264%20179.603%2042.9024%20180.123C43.0784%20180.643%2043.3224%20181.047%2043.6344%20181.335C43.9464%20181.623%2044.3064%20181.767%2044.7144%20181.767ZM44.7144%20182.775C44.0904%20182.775%2043.5344%20182.587%2043.0464%20182.211C42.5584%20181.835%2042.1784%20181.311%2041.9064%20180.639C41.6344%20179.959%2041.4984%20179.191%2041.4984%20178.335C41.4984%20177.479%2041.6344%20176.715%2041.9064%20176.043C42.1784%20175.363%2042.5584%20174.835%2043.0464%20174.459C43.5344%20174.083%2044.0904%20173.895%2044.7144%20173.895C45.3384%20173.895%2045.8944%20174.083%2046.3824%20174.459C46.8704%20174.835%2047.2504%20175.363%2047.5224%20176.043C47.7944%20176.715%2047.9304%20177.479%2047.9304%20178.335C47.9304%20179.191%2047.7944%20179.959%2047.5224%20180.639C47.2504%20181.311%2046.8704%20181.835%2046.3824%20182.211C45.8944%20182.587%2045.3384%20182.775%2044.7144%20182.775ZM52.3551%20181.767C52.7631%20181.767%2053.1231%20181.623%2053.4351%20181.335C53.7471%20181.047%2053.9911%20180.643%2054.1671%20180.123C54.3431%20179.603%2054.4311%20179.007%2054.4311%20178.335C54.4311%20177.663%2054.3431%20177.067%2054.1671%20176.547C53.9991%20176.027%2053.7551%20175.623%2053.4351%20175.335C53.1231%20175.047%2052.7631%20174.903%2052.3551%20174.903C51.9471%20174.903%2051.5831%20175.047%2051.2631%20175.335C50.9511%20175.623%2050.7071%20176.027%2050.5311%20176.547C50.3631%20177.067%2050.2791%20177.663%2050.2791%20178.335C50.2791%20179.007%2050.3671%20179.603%2050.5431%20180.123C50.7191%20180.643%2050.9631%20181.047%2051.2751%20181.335C51.5871%20181.623%2051.9471%20181.767%2052.3551%20181.767ZM52.3551%20182.775C51.7311%20182.775%2051.1751%20182.587%2050.6871%20182.211C50.1991%20181.835%2049.8191%20181.311%2049.5471%20180.639C49.2751%20179.959%2049.1391%20179.191%2049.1391%20178.335C49.1391%20177.479%2049.2751%20176.715%2049.5471%20176.043C49.8191%20175.363%2050.1991%20174.835%2050.6871%20174.459C51.1751%20174.083%2051.7311%20173.895%2052.3551%20173.895C52.9791%20173.895%2053.5351%20174.083%2054.0231%20174.459C54.5111%20174.835%2054.8911%20175.363%2055.1631%20176.043C55.4351%20176.715%2055.5711%20177.479%2055.5711%20178.335C55.5711%20179.191%2055.4351%20179.959%2055.1631%20180.639C54.8911%20181.311%2054.5111%20181.835%2054.0231%20182.211C53.5351%20182.587%2052.9791%20182.775%2052.3551%20182.775ZM68.1013%20172.971V183.615H66.9133V172.971H68.1013ZM62.4613%20173.763C62.9893%20173.763%2063.4573%20173.919%2063.8653%20174.231C64.2813%20174.535%2064.6053%20174.971%2064.8373%20175.539C65.0693%20176.099%2065.1853%20176.751%2065.1853%20177.495C65.1853%20178.247%2065.0693%20178.907%2064.8373%20179.475C64.6053%20180.043%2064.2813%20180.483%2063.8653%20180.795C63.4573%20181.099%2062.9893%20181.251%2062.4613%20181.251C61.9333%20181.251%2061.4613%20181.099%2061.0453%20180.795C60.6293%20180.483%2060.3053%20180.043%2060.0733%20179.475C59.8413%20178.907%2059.7253%20178.247%2059.7253%20177.495C59.7253%20176.751%2059.8413%20176.099%2060.0733%20175.539C60.3053%20174.971%2060.6293%20174.535%2061.0453%20174.231C61.4613%20173.919%2061.9333%20173.763%2062.4613%20173.763ZM62.4613%20174.831C61.9813%20174.831%2061.5933%20175.071%2061.2973%20175.551C61.0093%20176.031%2060.8653%20176.679%2060.8653%20177.495C60.8653%20178.319%2061.0093%20178.975%2061.2973%20179.463C61.5933%20179.943%2061.9813%20180.183%2062.4613%20180.183C62.9333%20180.183%2063.3173%20179.943%2063.6133%20179.463C63.9093%20178.975%2064.0573%20178.319%2064.0573%20177.495C64.0573%20176.679%2063.9093%20176.031%2063.6133%20175.551C63.3173%20175.071%2062.9333%20174.831%2062.4613%20174.831ZM73.5256%20173.547V174.675C73.5256%20175.379%2073.7496%20176.023%2074.1976%20176.607C74.6456%20177.183%2075.2576%20177.603%2076.0336%20177.867L75.4216%20178.779C74.8616%20178.587%2074.3696%20178.299%2073.9456%20177.915C73.5296%20177.523%2073.2016%20177.067%2072.9616%20176.547C72.7376%20177.139%2072.4056%20177.655%2071.9656%20178.095C71.5336%20178.535%2071.0136%20178.867%2070.4056%20179.091L69.7696%20178.155C70.5856%20177.867%2071.2216%20177.399%2071.6776%20176.751C72.1336%20176.095%2072.3616%20175.371%2072.3616%20174.579V173.547H73.5256ZM78.1456%20172.983V175.623H79.6576V176.607H78.1456V179.367H76.9696V172.983H78.1456ZM74.7376%20179.643C75.8336%20179.643%2076.6936%20179.815%2077.3176%20180.159C77.9496%20180.503%2078.2656%20180.987%2078.2656%20181.611C78.2656%20182.235%2077.9496%20182.719%2077.3176%20183.063C76.6936%20183.415%2075.8336%20183.591%2074.7376%20183.591C73.6416%20183.591%2072.7776%20183.415%2072.1456%20183.063C71.5216%20182.719%2071.2096%20182.235%2071.2096%20181.611C71.2096%20180.987%2071.5216%20180.503%2072.1456%20180.159C72.7776%20179.815%2073.6416%20179.643%2074.7376%20179.643ZM74.7376%20180.555C73.9936%20180.555%2073.4096%20180.647%2072.9856%20180.831C72.5696%20181.015%2072.3616%20181.275%2072.3616%20181.611C72.3616%20181.955%2072.5696%20182.219%2072.9856%20182.403C73.4016%20182.587%2073.9856%20182.679%2074.7376%20182.679C75.4816%20182.679%2076.0616%20182.587%2076.4776%20182.403C76.8936%20182.219%2077.1016%20181.955%2077.1016%20181.611C77.1016%20181.275%2076.8936%20181.015%2076.4776%20180.831C76.0616%20180.647%2075.4816%20180.555%2074.7376%20180.555ZM91.5075%20173.655V174.579C91.5075%20175.259%2091.4915%20175.863%2091.4595%20176.391C91.4275%20176.919%2091.3515%20177.519%2091.2315%20178.191H92.7195V179.163H88.4835V183.627H87.2955V179.163H83.1195V178.191H90.0315C90.1755%20177.535%2090.2635%20176.943%2090.2955%20176.415C90.3355%20175.887%2090.3555%20175.283%2090.3555%20174.603H84.2955V173.655H91.5075ZM102.656%20172.983V183.603H101.54V178.095H100.304V183.087H99.1878V173.199H100.304V177.135H101.54V172.983H102.656ZM98.0598%20174.159V180.831H93.9678V174.159H98.0598ZM95.0598%20175.083V179.907H96.9558V175.083H95.0598ZM110.75%20173.871V175.623C110.75%20176.271%20110.866%20176.907%20111.098%20177.531C111.33%20178.155%20111.654%20178.711%20112.07%20179.199C112.486%20179.679%20112.966%20180.039%20113.51%20180.279L112.814%20181.227C112.214%20180.939%20111.686%20180.515%20111.23%20179.955C110.774%20179.395%20110.422%20178.751%20110.174%20178.023C109.926%20178.815%20109.57%20179.507%20109.106%20180.099C108.642%20180.691%20108.098%20181.139%20107.474%20181.443L106.766%20180.471C107.31%20180.223%20107.794%20179.847%20108.218%20179.343C108.642%20178.839%20108.97%20178.263%20109.202%20177.615C109.442%20176.959%20109.562%20176.295%20109.562%20175.623V173.871H110.75ZM115.574%20172.971V183.615H114.398V172.971H115.574Z%22%20fill%3D%22%231D2939%22%2F%3E%0A%3Crect%20x%3D%2215%22%20y%3D%22222%22%20width%3D%22129%22%20height%3D%2239%22%20rx%3D%2216%22%20fill%3D%22%23126DFB%22%2F%3E%0A%3Cpath%20d%3D%22M57.3553%20235.564V237.612C57.3553%20238.999%2057.6273%20240.273%2058.1713%20241.436C58.7153%20242.588%2059.5419%20243.431%2060.6513%20243.964L59.3713%20245.66C58.6459%20245.297%2058.0273%20244.791%2057.5153%20244.14C57.0033%20243.479%2056.5926%20242.711%2056.2833%20241.836C55.9739%20242.775%2055.5419%20243.596%2054.9873%20244.3C54.4326%20244.993%2053.7606%20245.532%2052.9713%20245.916L51.7073%20244.188C52.8699%20243.644%2053.7446%20242.769%2054.3313%20241.564C54.9286%20240.359%2055.2273%20239.041%2055.2273%20237.612V235.564H57.3553ZM63.3073%20234.476V239.98H65.3713V241.756H63.3073V248.876H61.1633V234.476H63.3073ZM68.8916%20241.276V239.564C68.369%20239.319%2067.969%20239.02%2067.6916%20238.668C67.4143%20238.305%2067.2756%20237.9%2067.2756%20237.452C67.2756%20236.887%2067.489%20236.396%2067.9156%20235.98C68.3423%20235.553%2068.9503%20235.228%2069.7396%20235.004C70.529%20234.78%2071.4516%20234.668%2072.5076%20234.668C73.5636%20234.668%2074.4863%20234.78%2075.2756%20235.004C76.065%20235.228%2076.673%20235.553%2077.0996%20235.98C77.5263%20236.396%2077.7396%20236.887%2077.7396%20237.452C77.7396%20237.911%2077.5956%20238.321%2077.3076%20238.684C77.0196%20239.047%2076.6036%20239.351%2076.0596%20239.596V241.276H79.0036V242.94H65.9956V241.276H68.8916ZM72.4756%20243.644C74.033%20243.644%2075.2543%20243.873%2076.1396%20244.332C77.025%20244.78%2077.4676%20245.42%2077.4676%20246.252C77.4676%20247.084%2077.025%20247.729%2076.1396%20248.188C75.265%20248.647%2074.0436%20248.876%2072.4756%20248.876C70.9076%20248.876%2069.681%20248.647%2068.7956%20248.188C67.9103%20247.729%2067.4676%20247.084%2067.4676%20246.252C67.4676%20245.42%2067.9103%20244.78%2068.7956%20244.332C69.681%20243.873%2070.9076%20243.644%2072.4756%20243.644ZM72.4756%20245.244C71.5156%20245.244%2070.7956%20245.329%2070.3156%20245.5C69.8463%20245.66%2069.6116%20245.911%2069.6116%20246.252C69.6116%20246.604%2069.8463%20246.865%2070.3156%20247.036C70.785%20247.196%2071.505%20247.276%2072.4756%20247.276C73.4356%20247.276%2074.1503%20247.196%2074.6196%20247.036C75.089%20246.865%2075.3236%20246.604%2075.3236%20246.252C75.3236%20245.911%2075.089%20245.66%2074.6196%20245.5C74.1503%20245.329%2073.4356%20245.244%2072.4756%20245.244ZM72.5076%20236.284C71.5156%20236.284%2070.7583%20236.385%2070.2356%20236.588C69.7236%20236.78%2069.4676%20237.068%2069.4676%20237.452C69.4676%20237.836%2069.729%20238.124%2070.2516%20238.316C70.7743%20238.508%2071.5263%20238.604%2072.5076%20238.604C73.489%20238.604%2074.2356%20238.508%2074.7476%20238.316C75.2703%20238.124%2075.5316%20237.836%2075.5316%20237.452C75.5316%20237.068%2075.2703%20236.78%2074.7476%20236.588C74.2356%20236.385%2073.489%20236.284%2072.5076%20236.284ZM73.9476%20241.276V240.124C73.4463%20240.177%2072.9663%20240.204%2072.5076%20240.204C72.017%20240.204%2071.5156%20240.177%2071.0036%20240.124V241.276H73.9476ZM91.292%20234.476V240.06H93.34V241.82H91.292V248.876H89.164V234.476H91.292ZM83.036%20236.572V234.716H85.196V236.572H88.3V238.268H79.9V236.572H83.036ZM84.124%20239.052C84.8173%20239.052%2085.4413%20239.201%2085.996%20239.5C86.5613%20239.788%2086.9987%20240.193%2087.308%20240.716C87.628%20241.239%2087.788%20241.831%2087.788%20242.492C87.788%20243.153%2087.628%20243.745%2087.308%20244.268C86.9987%20244.791%2086.5613%20245.201%2085.996%20245.5C85.4413%20245.788%2084.8173%20245.932%2084.124%20245.932C83.4307%20245.932%2082.8067%20245.788%2082.252%20245.5C81.6973%20245.201%2081.26%20244.791%2080.94%20244.268C80.62%20243.745%2080.46%20243.153%2080.46%20242.492C80.46%20241.831%2080.62%20241.239%2080.94%20240.716C81.26%20240.193%2081.6973%20239.788%2082.252%20239.5C82.8067%20239.201%2083.4307%20239.052%2084.124%20239.052ZM84.124%20240.78C83.6333%20240.78%2083.2387%20240.935%2082.94%20241.244C82.652%20241.543%2082.508%20241.959%2082.508%20242.492C82.508%20243.025%2082.652%20243.447%2082.94%20243.756C83.2387%20244.055%2083.6333%20244.204%2084.124%20244.204C84.604%20244.204%2084.9933%20244.055%2085.292%20243.756C85.5907%20243.447%2085.74%20243.025%2085.74%20242.492C85.74%20241.959%2085.5907%20241.543%2085.292%20241.244C84.9933%20240.935%2084.604%20240.78%2084.124%20240.78ZM105.964%20234.46V248.86H103.82V234.46H105.964ZM101.692%20235.932C101.692%20237.5%20101.49%20238.919%20101.084%20240.188C100.69%20241.447%20100.007%20242.604%2099.0364%20243.66C98.0657%20244.716%2096.7484%20245.644%2095.0844%20246.444L93.9804%20244.764C95.783%20243.9%2097.111%20242.897%2097.9644%20241.756C98.8284%20240.615%2099.3404%20239.239%2099.5004%20237.628H94.7484V235.932H101.692Z%22%20fill%3D%22white%22%2F%3E%0A%3C%2Fsvg%3E%0A";
const INLINE_POINT_CARD_SVG_SRC = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22362%22%20height%3D%22127%22%20viewBox%3D%220%200%20362%20127%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0D%0A%3Cg%20clip-path%3D%22url(%23clip0_222_9052)%22%3E%0D%0A%3Cmask%20id%3D%22path-1-inside-1_222_9052%22%20fill%3D%22white%22%3E%0D%0A%3Cpath%20d%3D%22M0%2020C0%208.9543%208.9543%200%2020%200H342C353.046%200%20362%208.95431%20362%2020V107C362%20118.046%20353.046%20127%20342%20127H20C8.9543%20127%200%20118.046%200%20107V20Z%22%2F%3E%0D%0A%3C%2Fmask%3E%0D%0A%3Cpath%20d%3D%22M0%2020C0%208.9543%208.9543%200%2020%200H342C353.046%200%20362%208.95431%20362%2020V107C362%20118.046%20353.046%20127%20342%20127H20C8.9543%20127%200%20118.046%200%20107V20Z%22%20fill%3D%22%23E7F0FF%22%2F%3E%0D%0A%3Cg%20clip-path%3D%22url(%23paint0_angular_222_9052_clip_path)%22%20data-figma-skip-parse%3D%22true%22%20mask%3D%22url(%23path-1-inside-1_222_9052)%22%3E%3Cg%20transform%3D%22matrix(0%200.0635%20-0.181%200%20181%2063.5)%22%3E%3CforeignObject%20x%3D%22-1031.5%22%20y%3D%22-1031.5%22%20width%3D%222062.99%22%20height%3D%222062.99%22%3E%3Cdiv%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxhtml%22%20style%3D%22background%3Aconic-gradient(from%2090deg%2Crgba(18%2C%20109%2C%20251%2C%201)%200deg%2Crgba(255%2C%20255%2C%20255%2C%201)%2054deg%2Crgba(18%2C%20109%2C%20251%2C%201)%20180deg%2Crgba(16%2C%2065%2C%20167%2C%201)%20360deg)%3Bheight%3A100%25%3Bwidth%3A100%25%3Bopacity%3A1%22%3E%3C%2Fdiv%3E%3C%2FforeignObject%3E%3C%2Fg%3E%3C%2Fg%3E%3Cpath%20d%3D%22M20%200V2H342V0V-2H20V0ZM362%2020H360V107H362H364V20H362ZM342%20127V125H20V127V129H342V127ZM0%20107H2V20H0H-2V107H0ZM20%20127V125C10.0589%20125%202%20116.941%202%20107H0H-2C-2%20119.15%207.84974%20129%2020%20129V127ZM362%20107H360C360%20116.941%20351.941%20125%20342%20125V127V129C354.15%20129%20364%20119.15%20364%20107H362ZM342%200V2C351.941%202%20360%2010.0589%20360%2020H362H364C364%207.84974%20354.15%20-2%20342%20-2V0ZM20%200V-2C7.84974%20-2%20-2%207.84973%20-2%2020H0H2C2%2010.0589%2010.0589%202%2020%202V0Z%22%20data-figma-gradient-fill%3D%22%7B%26%2334%3Btype%26%2334%3B%3A%26%2334%3BGRADIENT_ANGULAR%26%2334%3B%2C%26%2334%3Bstops%26%2334%3B%3A%5B%7B%26%2334%3Bcolor%26%2334%3B%3A%7B%26%2334%3Br%26%2334%3B%3A0.070588238537311554%2C%26%2334%3Bg%26%2334%3B%3A0.42745098471641541%2C%26%2334%3Bb%26%2334%3B%3A0.98431372642517090%2C%26%2334%3Ba%26%2334%3B%3A1.0%7D%2C%26%2334%3Bposition%26%2334%3B%3A0.0%7D%2C%7B%26%2334%3Bcolor%26%2334%3B%3A%7B%26%2334%3Br%26%2334%3B%3A1.0%2C%26%2334%3Bg%26%2334%3B%3A1.0%2C%26%2334%3Bb%26%2334%3B%3A1.0%2C%26%2334%3Ba%26%2334%3B%3A1.0%7D%2C%26%2334%3Bposition%26%2334%3B%3A0.15000000596046448%7D%2C%7B%26%2334%3Bcolor%26%2334%3B%3A%7B%26%2334%3Br%26%2334%3B%3A0.070588238537311554%2C%26%2334%3Bg%26%2334%3B%3A0.42745098471641541%2C%26%2334%3Bb%26%2334%3B%3A0.98431372642517090%2C%26%2334%3Ba%26%2334%3B%3A1.0%7D%2C%26%2334%3Bposition%26%2334%3B%3A0.50%7D%2C%7B%26%2334%3Bcolor%26%2334%3B%3A%7B%26%2334%3Br%26%2334%3B%3A0.062745101749897003%2C%26%2334%3Bg%26%2334%3B%3A0.25490197539329529%2C%26%2334%3Bb%26%2334%3B%3A0.65490198135375977%2C%26%2334%3Ba%26%2334%3B%3A1.0%7D%2C%26%2334%3Bposition%26%2334%3B%3A1.0%7D%5D%2C%26%2334%3BstopsVar%26%2334%3B%3A%5B%7B%26%2334%3Bcolor%26%2334%3B%3A%7B%26%2334%3Br%26%2334%3B%3A0.070588238537311554%2C%26%2334%3Bg%26%2334%3B%3A0.42745098471641541%2C%26%2334%3Bb%26%2334%3B%3A0.98431372642517090%2C%26%2334%3Ba%26%2334%3B%3A1.0%7D%2C%26%2334%3Bposition%26%2334%3B%3A0.0%7D%2C%7B%26%2334%3Bcolor%26%2334%3B%3A%7B%26%2334%3Br%26%2334%3B%3A1.0%2C%26%2334%3Bg%26%2334%3B%3A1.0%2C%26%2334%3Bb%26%2334%3B%3A1.0%2C%26%2334%3Ba%26%2334%3B%3A1.0%7D%2C%26%2334%3Bposition%26%2334%3B%3A0.15000000596046448%7D%2C%7B%26%2334%3Bcolor%26%2334%3B%3A%7B%26%2334%3Br%26%2334%3B%3A0.070588238537311554%2C%26%2334%3Bg%26%2334%3B%3A0.42745098471641541%2C%26%2334%3Bb%26%2334%3B%3A0.98431372642517090%2C%26%2334%3Ba%26%2334%3B%3A1.0%7D%2C%26%2334%3Bposition%26%2334%3B%3A0.50%7D%2C%7B%26%2334%3Bcolor%26%2334%3B%3A%7B%26%2334%3Br%26%2334%3B%3A0.062745101749897003%2C%26%2334%3Bg%26%2334%3B%3A0.25490197539329529%2C%26%2334%3Bb%26%2334%3B%3A0.65490198135375977%2C%26%2334%3Ba%26%2334%3B%3A1.0%7D%2C%26%2334%3Bposition%26%2334%3B%3A1.0%7D%5D%2C%26%2334%3Btransform%26%2334%3B%3A%7B%26%2334%3Bm00%26%2334%3B%3A3.7719122530227578e-14%2C%26%2334%3Bm01%26%2334%3B%3A-362.0%2C%26%2334%3Bm02%26%2334%3B%3A361.99996948242188%2C%26%2334%3Bm10%26%2334%3B%3A127.0%2C%26%2334%3Bm11%26%2334%3B%3A5.2108718137959184e-14%2C%26%2334%3Bm12%26%2334%3B%3A-3.8049804516049335e-06%7D%2C%26%2334%3Bopacity%26%2334%3B%3A1.0%2C%26%2334%3BblendMode%26%2334%3B%3A%26%2334%3BNORMAL%26%2334%3B%2C%26%2334%3Bvisible%26%2334%3B%3Atrue%7D%22%20mask%3D%22url(%23path-1-inside-1_222_9052)%22%2F%3E%0D%0A%3Crect%20x%3D%2217%22%20y%3D%2242%22%20width%3D%2262%22%20height%3D%2262%22%20rx%3D%2231%22%20fill%3D%22url(%23pattern0_222_9052)%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%2F%3E%0D%0A%3Cpath%20d%3D%22M98.148%2027.36V33.228C98.732%2033.212%2099.264%2033.184%2099.744%2033.144C100.232%2033.096%20100.728%2033.02%20101.232%2032.916L101.4%2034.02C100.792%2034.156%20100.192%2034.248%2099.6%2034.296C99.008%2034.336%2098.336%2034.356%2097.584%2034.356H96.852V27.36H98.148ZM105.552%2026.28V36.96H104.304V26.28H105.552ZM102.036%2029.736V26.496H103.26V36.456H102.036V30.816H99.816V29.736H102.036ZM115.704%2026.268V36.984H114.372V26.268H115.704ZM109.992%2027.048C110.528%2027.048%20111.004%2027.204%20111.42%2027.516C111.844%2027.82%20112.172%2028.26%20112.404%2028.836C112.644%2029.404%20112.764%2030.068%20112.764%2030.828C112.764%2031.588%20112.644%2032.256%20112.404%2032.832C112.172%2033.408%20111.844%2033.852%20111.42%2034.164C111.004%2034.468%20110.528%2034.62%20109.992%2034.62C109.456%2034.62%20108.976%2034.468%20108.552%2034.164C108.136%2033.852%20107.808%2033.408%20107.568%2032.832C107.336%2032.256%20107.22%2031.588%20107.22%2030.828C107.22%2030.068%20107.336%2029.404%20107.568%2028.836C107.808%2028.26%20108.136%2027.82%20108.552%2027.516C108.976%2027.204%20109.456%2027.048%20109.992%2027.048ZM109.992%2028.248C109.544%2028.248%20109.18%2028.48%20108.9%2028.944C108.628%2029.4%20108.492%2030.028%20108.492%2030.828C108.492%2031.636%20108.628%2032.272%20108.9%2032.736C109.18%2033.2%20109.544%2033.432%20109.992%2033.432C110.44%2033.432%20110.8%2033.2%20111.072%2032.736C111.352%2032.272%20111.492%2031.636%20111.492%2030.828C111.492%2030.028%20111.352%2029.4%20111.072%2028.944C110.8%2028.48%20110.44%2028.248%20109.992%2028.248ZM126.277%2026.268V36.984H124.957V31.176H122.833V34.404H117.781V27.12H119.101V29.772H121.525V27.12H122.833V30.12H124.957V26.268H126.277ZM119.101%2033.336H121.525V30.816H119.101V33.336ZM137.077%2026.292V36.972H135.817V26.292H137.077ZM133.717%2030.252V26.52H134.953V36.444H133.717V31.404H132.529V30.252H133.717ZM132.817%2027.54V28.608H132.061V33.228L132.997%2033.132L133.093%2034.08C131.869%2034.336%20130.137%2034.464%20127.897%2034.464L127.753%2033.384H128.689V28.608H127.945V27.54H132.817ZM130.861%2033.312V28.608H129.877V33.348L130.861%2033.312ZM147.169%2026.268V36.984H145.837V26.268H147.169ZM141.457%2027.048C141.993%2027.048%20142.469%2027.204%20142.885%2027.516C143.309%2027.82%20143.637%2028.26%20143.869%2028.836C144.109%2029.404%20144.229%2030.068%20144.229%2030.828C144.229%2031.588%20144.109%2032.256%20143.869%2032.832C143.637%2033.408%20143.309%2033.852%20142.885%2034.164C142.469%2034.468%20141.993%2034.62%20141.457%2034.62C140.921%2034.62%20140.441%2034.468%20140.017%2034.164C139.601%2033.852%20139.273%2033.408%20139.033%2032.832C138.801%2032.256%20138.685%2031.588%20138.685%2030.828C138.685%2030.068%20138.801%2029.404%20139.033%2028.836C139.273%2028.26%20139.601%2027.82%20140.017%2027.516C140.441%2027.204%20140.921%2027.048%20141.457%2027.048ZM141.457%2028.248C141.009%2028.248%20140.645%2028.48%20140.365%2028.944C140.093%2029.4%20139.957%2030.028%20139.957%2030.828C139.957%2031.636%20140.093%2032.272%20140.365%2032.736C140.645%2033.2%20141.009%2033.432%20141.457%2033.432C141.905%2033.432%20142.265%2033.2%20142.537%2032.736C142.817%2032.272%20142.957%2031.636%20142.957%2030.828C142.957%2030.028%20142.817%2029.4%20142.537%2028.944C142.265%2028.48%20141.905%2028.248%20141.457%2028.248ZM155.767%2034.632V32.532H152.443V31.476H153.931V28.272H152.395V27.216H160.447V28.272H158.923V31.476H160.423V32.532H157.075V34.632H161.287V35.712H151.615V34.632H155.767ZM157.615%2031.476V28.272H155.251V31.476H157.615ZM170.923%2026.292V34.008H169.603V26.292H170.923ZM165.223%2033.24V35.7H171.211V36.756H163.915V33.24H165.223ZM165.139%2026.988C165.675%2026.988%20166.159%2027.104%20166.591%2027.336C167.031%2027.56%20167.375%2027.88%20167.623%2028.296C167.871%2028.704%20167.995%2029.164%20167.995%2029.676C167.995%2030.18%20167.871%2030.636%20167.623%2031.044C167.375%2031.452%20167.031%2031.772%20166.591%2032.004C166.159%2032.236%20165.675%2032.352%20165.139%2032.352C164.611%2032.352%20164.127%2032.236%20163.687%2032.004C163.255%2031.772%20162.911%2031.452%20162.655%2031.044C162.407%2030.636%20162.283%2030.18%20162.283%2029.676C162.283%2029.164%20162.407%2028.704%20162.655%2028.296C162.911%2027.88%20163.255%2027.56%20163.687%2027.336C164.127%2027.104%20164.611%2026.988%20165.139%2026.988ZM165.139%2028.128C164.683%2028.128%20164.307%2028.272%20164.011%2028.56C163.715%2028.84%20163.567%2029.212%20163.567%2029.676C163.567%2030.132%20163.715%2030.5%20164.011%2030.78C164.315%2031.06%20164.691%2031.2%20165.139%2031.2C165.587%2031.2%20165.959%2031.06%20166.255%2030.78C166.559%2030.5%20166.711%2030.132%20166.711%2029.676C166.711%2029.212%20166.563%2028.84%20166.267%2028.56C165.971%2028.272%20165.595%2028.128%20165.139%2028.128ZM181.112%2027.108V28.164H175.1V29.472H180.872V30.504H175.1V31.872H181.208V32.928H173.768V27.108H181.112ZM182.264%2034.608V35.676H172.592V34.608H182.264Z%22%20fill%3D%22black%22%2F%3E%0D%0A%3Cpath%20d%3D%22M343.894%2027.2657C343.554%2026.9038%20343.149%2026.6166%20342.704%2026.4208C342.259%2026.2249%20341.782%2026.124%20341.301%2026.124C340.819%2026.124%20340.342%2026.2249%20339.897%2026.4208C339.452%2026.6166%20339.048%2026.9038%20338.707%2027.2657L338.001%2028.0166L337.294%2027.2657C336.606%2026.535%20335.673%2026.1244%20334.701%2026.1244C333.728%2026.1244%20332.795%2026.535%20332.107%2027.2657C331.42%2027.9965%20331.033%2028.9877%20331.033%2030.0211C331.033%2031.0546%20331.42%2032.0458%20332.107%2032.7766L338.001%2039.0382L343.894%2032.7766C344.235%2032.4148%20344.505%2031.9852%20344.689%2031.5124C344.874%2031.0397%20344.969%2030.5329%20344.969%2030.0211C344.969%2029.5094%20344.874%2029.0026%20344.689%2028.5299C344.505%2028.0571%20344.235%2027.6275%20343.894%2027.2657Z%22%20stroke%3D%22%231E1E1E%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0D%0A%3Cpath%20d%3D%22M106.78%2075.196L102.524%2075.14V58.956L98.324%2060.664L96.952%2056.912L102.552%2054.588H106.78V75.196ZM111.332%2071.472C112.209%2070.632%20113.46%2069.5493%20115.084%2068.224C116.334%2067.216%20117.305%2066.3853%20117.996%2065.732C118.705%2065.0787%20119.284%2064.4067%20119.732%2063.716C120.198%2063.0253%20120.432%2062.3347%20120.432%2061.644C120.432%2060.692%20120.161%2059.9173%20119.62%2059.32C119.097%2058.7227%20118.416%2058.424%20117.576%2058.424C116.866%2058.424%20116.185%2058.6387%20115.532%2059.068C114.878%2059.4973%20114.402%2060.0573%20114.104%2060.748L110.492%2059.124C111.108%2057.7613%20112.078%2056.6413%20113.404%2055.764C114.729%2054.8867%20116.12%2054.448%20117.576%2054.448C118.957%2054.448%20120.18%2054.756%20121.244%2055.372C122.326%2055.9693%20123.166%2056.8187%20123.764%2057.92C124.38%2059.0027%20124.688%2060.244%20124.688%2061.644C124.688%2062.932%20124.361%2064.1547%20123.708%2065.312C123.073%2066.4507%20122.27%2067.4867%20121.3%2068.42C120.348%2069.3347%20119.162%2070.352%20117.744%2071.472H124.968V75.168H111.612L111.332%2071.472ZM129.913%2079.956H126.777L128.093%2071.836H132.349L129.913%2079.956ZM136.92%2066.208L137.676%2054.616H149.66V58.312H141.764L141.512%2061.672C142.333%2061.4293%20143.089%2061.308%20143.78%2061.308C145.273%2061.308%20146.598%2061.6067%20147.756%2062.204C148.913%2062.8013%20149.818%2063.6413%20150.472%2064.724C151.125%2065.788%20151.452%2067.0107%20151.452%2068.392C151.452%2069.7547%20151.125%2070.9773%20150.472%2072.06C149.818%2073.124%20148.913%2073.9547%20147.756%2074.552C146.598%2075.1493%20145.273%2075.448%20143.78%2075.448C142.604%2075.448%20141.493%2075.2053%20140.448%2074.72C139.421%2074.2347%20138.544%2073.5627%20137.816%2072.704C137.088%2071.8453%20136.593%2070.8653%20136.332%2069.764L140.476%2068.756C140.662%2069.5587%20141.064%2070.212%20141.68%2070.716C142.296%2071.22%20142.996%2071.472%20143.78%2071.472C144.788%2071.472%20145.609%2071.192%20146.244%2070.632C146.878%2070.0533%20147.196%2069.3067%20147.196%2068.392C147.196%2067.4773%20146.878%2066.7307%20146.244%2066.152C145.609%2065.5733%20144.788%2065.284%20143.78%2065.284C143.406%2065.284%20142.968%2065.4147%20142.464%2065.676C141.978%2065.9187%20141.54%2066.2453%20141.148%2066.656L136.92%2066.208ZM162.038%2071.668C163.27%2071.668%20164.25%2071.0613%20164.978%2069.848C165.706%2068.616%20166.07%2066.9547%20166.07%2064.864C166.07%2062.7733%20165.706%2061.1213%20164.978%2059.908C164.25%2058.676%20163.27%2058.06%20162.038%2058.06C160.787%2058.06%20159.798%2058.676%20159.07%2059.908C158.342%2061.1213%20157.978%2062.7733%20157.978%2064.864C157.978%2066.9547%20158.342%2068.616%20159.07%2069.848C159.798%2071.0613%20160.787%2071.668%20162.038%2071.668ZM162.038%2075.364C160.432%2075.364%20158.995%2074.916%20157.726%2074.02C156.475%2073.124%20155.495%2071.8827%20154.786%2070.296C154.076%2068.7093%20153.722%2066.8987%20153.722%2064.864C153.722%2062.8293%20154.076%2061.0187%20154.786%2059.432C155.495%2057.8453%20156.475%2056.604%20157.726%2055.708C158.995%2054.812%20160.432%2054.364%20162.038%2054.364C163.643%2054.364%20165.071%2054.812%20166.322%2055.708C167.591%2056.604%20168.571%2057.8453%20169.262%2059.432C169.971%2061.0187%20170.326%2062.8293%20170.326%2064.864C170.326%2066.8987%20169.971%2068.7093%20169.262%2070.296C168.571%2071.8827%20167.591%2073.124%20166.322%2074.02C165.071%2074.916%20163.643%2075.364%20162.038%2075.364ZM180.877%2071.668C182.109%2071.668%20183.089%2071.0613%20183.817%2069.848C184.545%2068.616%20184.909%2066.9547%20184.909%2064.864C184.909%2062.7733%20184.545%2061.1213%20183.817%2059.908C183.089%2058.676%20182.109%2058.06%20180.877%2058.06C179.627%2058.06%20178.637%2058.676%20177.909%2059.908C177.181%2061.1213%20176.817%2062.7733%20176.817%2064.864C176.817%2066.9547%20177.181%2068.616%20177.909%2069.848C178.637%2071.0613%20179.627%2071.668%20180.877%2071.668ZM180.877%2075.364C179.272%2075.364%20177.835%2074.916%20176.565%2074.02C175.315%2073.124%20174.335%2071.8827%20173.625%2070.296C172.916%2068.7093%20172.561%2066.8987%20172.561%2064.864C172.561%2062.8293%20172.916%2061.0187%20173.625%2059.432C174.335%2057.8453%20175.315%2056.604%20176.565%2055.708C177.835%2054.812%20179.272%2054.364%20180.877%2054.364C182.483%2054.364%20183.911%2054.812%20185.161%2055.708C186.431%2056.604%20187.411%2057.8453%20188.101%2059.432C188.811%2061.0187%20189.165%2062.8293%20189.165%2064.864C189.165%2066.8987%20188.811%2068.7093%20188.101%2070.296C187.411%2071.8827%20186.431%2073.124%20185.161%2074.02C183.911%2074.916%20182.483%2075.364%20180.877%2075.364ZM199.661%2072.06C200.52%2072.06%20201.183%2071.752%20201.649%2071.136C202.135%2070.52%20202.377%2069.652%20202.377%2068.532C202.377%2067.412%20202.135%2066.544%20201.649%2065.928C201.183%2065.312%20200.52%2065.004%20199.661%2065.004C198.784%2065.004%20198.056%2065.34%20197.477%2066.012C196.899%2066.6653%20196.609%2067.5053%20196.609%2068.532C196.609%2069.5587%20196.899%2070.408%20197.477%2071.08C198.056%2071.7333%20198.784%2072.06%20199.661%2072.06ZM200.277%2061.56C201.547%2061.56%20202.657%2061.8587%20203.609%2062.456C204.58%2063.0347%20205.327%2063.856%20205.849%2064.92C206.372%2065.9653%20206.633%2067.1693%20206.633%2068.532C206.633%2069.8947%20206.372%2071.108%20205.849%2072.172C205.327%2073.236%20204.58%2074.0667%20203.609%2074.664C202.657%2075.2427%20201.547%2075.532%20200.277%2075.532C199.792%2075.532%20199.195%2075.4107%20198.485%2075.168C197.776%2074.944%20197.151%2074.4493%20196.609%2073.684V81.356H192.353V61.588H196.609V63.408C197.151%2062.6987%20197.785%2062.2133%20198.513%2061.952C199.26%2061.6907%20199.848%2061.56%20200.277%2061.56Z%22%20fill%3D%22black%22%2F%3E%0D%0A%3Cpath%20d%3D%22M101.76%2093.276V98.208H96.888V93.276H101.76ZM97.908%2094.116V97.356H100.752V94.116H97.908ZM104.676%2092.34V95.532H106.212V96.396H104.676V100.068H103.632V92.34H104.676ZM99.108%2099.336V101.832H105.132V102.672H98.076V99.336H99.108ZM109.584%20100.764V98.808H108.132V95.508H114.312V93.948H108.108V93.108H115.344V96.336H109.152V97.968H115.584V98.808H113.964V100.764H116.508V101.616H106.944V100.764H109.584ZM112.956%20100.764V98.808H110.604V100.764H112.956ZM126.109%2092.34V102.9H125.065V92.34H126.109ZM122.989%2093.468C122.989%2096.876%20121.357%2099.372%20118.093%20100.956L117.541%20100.128C120.261%2098.824%20121.725%2096.888%20121.933%2094.32H118.033V93.468H122.989ZM136.129%2092.352V95.784H137.677V96.648H136.129V100.272H135.085V92.352H136.129ZM130.549%2093.6V92.352H131.581V93.6H134.185V94.44H127.945V93.6H130.549ZM131.065%2094.992C131.561%2094.992%20132.001%2095.076%20132.385%2095.244C132.769%2095.404%20133.065%2095.636%20133.273%2095.94C133.489%2096.236%20133.597%2096.58%20133.597%2096.972C133.597%2097.572%20133.361%2098.052%20132.889%2098.412C132.425%2098.772%20131.817%2098.952%20131.065%2098.952C130.313%2098.952%20129.701%2098.772%20129.229%2098.412C128.765%2098.052%20128.533%2097.572%20128.533%2096.972C128.533%2096.58%20128.637%2096.236%20128.845%2095.94C129.061%2095.636%20129.361%2095.404%20129.745%2095.244C130.129%2095.076%20130.569%2094.992%20131.065%2094.992ZM131.065%2095.808C130.601%2095.808%20130.225%2095.912%20129.937%2096.12C129.657%2096.328%20129.517%2096.612%20129.517%2096.972C129.517%2097.332%20129.657%2097.616%20129.937%2097.824C130.225%2098.032%20130.601%2098.136%20131.065%2098.136C131.529%2098.136%20131.901%2098.032%20132.181%2097.824C132.461%2097.616%20132.601%2097.332%20132.601%2096.972C132.601%2096.612%20132.461%2096.328%20132.181%2096.12C131.901%2095.912%20131.529%2095.808%20131.065%2095.808ZM130.561%2099.636V101.832H136.597V102.672H129.529V99.636H130.561ZM141.451%20101.136C141.779%20100.816%20142.123%20100.496%20142.483%20100.176C143.179%2099.544%20143.739%2099.008%20144.163%2098.568C144.595%2098.128%20144.959%2097.68%20145.255%2097.224C145.559%2096.768%20145.711%2096.344%20145.711%2095.952C145.711%2095.416%20145.555%2094.98%20145.243%2094.644C144.939%2094.3%20144.543%2094.128%20144.055%2094.128C143.695%2094.128%20143.347%2094.248%20143.011%2094.488C142.683%2094.728%20142.435%2095.04%20142.267%2095.424L141.367%2095.028C141.599%2094.5%20141.967%2094.068%20142.471%2093.732C142.975%2093.396%20143.503%2093.228%20144.055%2093.228C144.567%2093.228%20145.023%2093.344%20145.423%2093.576C145.831%2093.808%20146.147%2094.132%20146.371%2094.548C146.595%2094.956%20146.707%2095.424%20146.707%2095.952C146.707%2096.472%20146.543%2097.004%20146.215%2097.548C145.887%2098.084%20145.491%2098.588%20145.027%2099.06C144.571%2099.532%20143.983%20100.092%20143.263%20100.74L142.831%20101.136H146.851V102.024H141.571L141.451%20101.136ZM151.272%20101.208C151.688%20101.208%20152.056%20101.06%20152.376%20100.764C152.704%20100.46%20152.956%20100.04%20153.132%2099.504C153.316%2098.968%20153.408%2098.356%20153.408%2097.668C153.408%2096.98%20153.316%2096.368%20153.132%2095.832C152.956%2095.296%20152.704%2094.88%20152.376%2094.584C152.056%2094.28%20151.688%2094.128%20151.272%2094.128C150.856%2094.128%20150.484%2094.28%20150.156%2094.584C149.828%2094.88%20149.572%2095.296%20149.388%2095.832C149.204%2096.368%20149.112%2096.98%20149.112%2097.668C149.112%2098.356%20149.204%2098.968%20149.388%2099.504C149.572%20100.04%20149.828%20100.46%20150.156%20100.764C150.484%20101.06%20150.856%20101.208%20151.272%20101.208ZM151.272%20102.096C150.656%20102.096%20150.108%20101.908%20149.628%20101.532C149.156%20101.156%20148.784%20100.632%20148.512%2099.96C148.248%2099.288%20148.116%2098.524%20148.116%2097.668C148.116%2096.812%20148.248%2096.052%20148.512%2095.388C148.784%2094.716%20149.156%2094.192%20149.628%2093.816C150.108%2093.44%20150.656%2093.252%20151.272%2093.252C151.88%2093.252%20152.42%2093.44%20152.892%2093.816C153.364%2094.192%20153.732%2094.716%20153.996%2095.388C154.268%2096.052%20154.404%2096.812%20154.404%2097.668C154.404%2098.524%20154.268%2099.288%20153.996%2099.96C153.732%20100.632%20153.364%20101.156%20152.892%20101.532C152.42%20101.908%20151.88%20102.096%20151.272%20102.096ZM155.771%20101.136C156.099%20100.816%20156.443%20100.496%20156.803%20100.176C157.499%2099.544%20158.059%2099.008%20158.483%2098.568C158.915%2098.128%20159.279%2097.68%20159.575%2097.224C159.879%2096.768%20160.031%2096.344%20160.031%2095.952C160.031%2095.416%20159.875%2094.98%20159.563%2094.644C159.259%2094.3%20158.863%2094.128%20158.375%2094.128C158.015%2094.128%20157.667%2094.248%20157.331%2094.488C157.003%2094.728%20156.755%2095.04%20156.587%2095.424L155.687%2095.028C155.919%2094.5%20156.287%2094.068%20156.791%2093.732C157.295%2093.396%20157.823%2093.228%20158.375%2093.228C158.887%2093.228%20159.343%2093.344%20159.743%2093.576C160.151%2093.808%20160.467%2094.132%20160.691%2094.548C160.915%2094.956%20161.027%2095.424%20161.027%2095.952C161.027%2096.472%20160.863%2097.004%20160.535%2097.548C160.207%2098.084%20159.811%2098.588%20159.347%2099.06C158.891%2099.532%20158.303%20100.092%20157.583%20100.74L157.151%20101.136H161.171V102.024H155.891L155.771%20101.136ZM165.34%20101.22C165.909%20101.22%20166.373%20101.036%20166.733%20100.668C167.093%20100.3%20167.273%2099.824%20167.273%2099.24C167.273%2098.656%20167.093%2098.18%20166.733%2097.812C166.373%2097.436%20165.909%2097.248%20165.34%2097.248C164.789%2097.248%20164.333%2097.436%20163.973%2097.812C163.621%2098.18%20163.445%2098.656%20163.445%2099.24C163.445%2099.824%20163.621%20100.3%20163.973%20100.668C164.333%20101.036%20164.789%20101.22%20165.34%20101.22ZM162.449%2099.24C162.449%2098.704%20162.601%2098.16%20162.905%2097.608L165.34%2093.312H166.493L164.705%2096.432C164.993%2096.384%20165.213%2096.36%20165.365%2096.36C165.933%2096.36%20166.437%2096.484%20166.877%2096.732C167.317%2096.972%20167.657%2097.312%20167.897%2097.752C168.145%2098.184%20168.269%2098.68%20168.269%2099.24C168.269%2099.792%20168.145%20100.288%20167.897%20100.728C167.649%20101.16%20167.305%20101.5%20166.865%20101.748C166.425%20101.988%20165.925%20102.108%20165.365%20102.108C164.797%20102.108%20164.293%20101.988%20163.853%20101.748C163.413%20101.5%20163.069%20101.16%20162.821%20100.728C162.573%20100.288%20162.449%2099.792%20162.449%2099.24ZM174.854%2097.08V98.076H169.73V97.08H174.854ZM179.132%20102.012H178.136V94.44L176.72%2095.352L176.228%2094.56L178.136%2093.336H179.132V102.012ZM181.06%20101.136C181.388%20100.816%20181.732%20100.496%20182.092%20100.176C182.788%2099.544%20183.348%2099.008%20183.772%2098.568C184.204%2098.128%20184.568%2097.68%20184.864%2097.224C185.168%2096.768%20185.32%2096.344%20185.32%2095.952C185.32%2095.416%20185.164%2094.98%20184.852%2094.644C184.548%2094.3%20184.152%2094.128%20183.664%2094.128C183.304%2094.128%20182.956%2094.248%20182.62%2094.488C182.292%2094.728%20182.044%2095.04%20181.876%2095.424L180.976%2095.028C181.208%2094.5%20181.576%2094.068%20182.08%2093.732C182.584%2093.396%20183.112%2093.228%20183.664%2093.228C184.176%2093.228%20184.632%2093.344%20185.032%2093.576C185.44%2093.808%20185.756%2094.132%20185.98%2094.548C186.204%2094.956%20186.316%2095.424%20186.316%2095.952C186.316%2096.472%20186.152%2097.004%20185.824%2097.548C185.496%2098.084%20185.1%2098.588%20184.636%2099.06C184.18%2099.532%20183.592%20100.092%20182.872%20100.74L182.44%20101.136H186.46V102.024H181.18L181.06%20101.136ZM193.042%2097.08V98.076H187.918V97.08H193.042ZM198.975%2097.524C199.351%2097.748%20199.647%2098.052%20199.863%2098.436C200.079%2098.812%20200.187%2099.184%20200.187%2099.552C200.187%20100.04%20200.067%20100.476%20199.827%20100.86C199.587%20101.244%20199.251%20101.544%20198.819%20101.76C198.387%20101.976%20197.895%20102.084%20197.343%20102.084C196.791%20102.084%20196.299%20101.976%20195.867%20101.76C195.435%20101.544%20195.099%20101.244%20194.859%20100.86C194.619%20100.468%20194.499%20100.024%20194.499%2099.528H195.495C195.495%20100.016%20195.667%20100.416%20196.011%20100.728C196.355%20101.04%20196.799%20101.196%20197.343%20101.196C197.887%20101.196%20198.331%20101.044%20198.675%20100.74C199.027%20100.428%20199.203%20100.028%20199.203%2099.54C199.203%2099.076%20199.031%2098.696%20198.687%2098.4C198.343%2098.104%20197.903%2097.956%20197.367%2097.956H196.731V97.068H197.367C197.871%2097.068%20198.283%2096.936%20198.603%2096.672C198.923%2096.4%20199.083%2096.052%20199.083%2095.628C199.083%2095.188%20198.927%2094.832%20198.615%2094.56C198.303%2094.28%20197.903%2094.14%20197.415%2094.14C196.927%2094.14%20196.527%2094.28%20196.215%2094.56C195.903%2094.84%20195.747%2095.204%20195.747%2095.652H194.751C194.751%2095.188%20194.863%2094.776%20195.087%2094.416C195.311%2094.048%20195.623%2093.764%20196.023%2093.564C196.431%2093.356%20196.895%2093.252%20197.415%2093.252C197.927%2093.252%20198.383%2093.352%20198.783%2093.552C199.183%2093.752%20199.495%2094.032%20199.719%2094.392C199.951%2094.752%20200.067%2095.16%20200.067%2095.616C200.067%2095.96%20199.967%2096.308%20199.767%2096.66C199.575%2097.012%20199.311%2097.3%20198.975%2097.524ZM204.28%20102.012H203.284V94.44L201.868%2095.352L201.376%2094.56L203.284%2093.336H204.28V102.012Z%22%20fill%3D%22black%22%2F%3E%0D%0A%3Cpath%20d%3D%22M56%200.75C64.4223%200.75%2071.25%207.57766%2071.25%2016V20C71.25%2028.4223%2064.4223%2035.25%2056%2035.25H16C7.57766%2035.25%200.75%2028.4223%200.75%2020V0.75H56Z%22%20fill%3D%22%23FDECEA%22%2F%3E%0D%0A%3Cpath%20d%3D%22M56%200.75C64.4223%200.75%2071.25%207.57766%2071.25%2016V20C71.25%2028.4223%2064.4223%2035.25%2056%2035.25H16C7.57766%2035.25%200.75%2028.4223%200.75%2020V0.75H56Z%22%20stroke%3D%22%23F44336%22%20stroke-width%3D%221.5%22%2F%3E%0D%0A%3Cpath%20d%3D%22M26.332%2022.4C27.1213%2022.4%2027.8147%2022.2293%2028.412%2021.888C29.0093%2021.536%2029.468%2021.0453%2029.788%2020.416C30.1187%2019.7867%2030.284%2019.056%2030.284%2018.224C30.284%2017.3813%2030.1187%2016.6453%2029.788%2016.016C29.468%2015.3867%2029.0093%2014.9013%2028.412%2014.56C27.8147%2014.208%2027.1213%2014.032%2026.332%2014.032L24.78%2014.048V22.384L26.332%2022.4ZM26.364%2012.24C27.516%2012.24%2028.5453%2012.496%2029.452%2013.008C30.3587%2013.5093%2031.0627%2014.2133%2031.564%2015.12C32.076%2016.0267%2032.332%2017.0613%2032.332%2018.224C32.332%2019.3867%2032.076%2020.4213%2031.564%2021.328C31.0627%2022.2347%2030.3587%2022.944%2029.452%2023.456C28.5453%2023.9573%2027.516%2024.208%2026.364%2024.208H22.716V12.24H26.364ZM41.5186%2017.072V19.136H34.3826V17.072H41.5186ZM48.148%2024.08L46.084%2024.048V14.528L43.86%2015.584L43.108%2013.792L46.1%2012.368H48.148V24.08Z%22%20fill%3D%22%23F44336%22%2F%3E%0D%0A%3C%2Fg%3E%0D%0A%3Cdefs%3E%0D%0A%3CclipPath%20id%3D%22paint0_angular_222_9052_clip_path%22%3E%3Cpath%20d%3D%22M20%200V2H342V0V-2H20V0ZM362%2020H360V107H362H364V20H362ZM342%20127V125H20V127V129H342V127ZM0%20107H2V20H0H-2V107H0ZM20%20127V125C10.0589%20125%202%20116.941%202%20107H0H-2C-2%20119.15%207.84974%20129%2020%20129V127ZM362%20107H360C360%20116.941%20351.941%20125%20342%20125V127V129C354.15%20129%20364%20119.15%20364%20107H362ZM342%200V2C351.941%202%20360%2010.0589%20360%2020H362H364C364%207.84974%20354.15%20-2%20342%20-2V0ZM20%200V-2C7.84974%20-2%20-2%207.84973%20-2%2020H0H2C2%2010.0589%2010.0589%202%2020%202V0Z%22%2F%3E%3C%2FclipPath%3E%3Cpattern%20id%3D%22pattern0_222_9052%22%20patternContentUnits%3D%22objectBoundingBox%22%20width%3D%221%22%20height%3D%221%22%3E%0D%0A%3Cuse%20xlink%3Ahref%3D%22%23image0_222_9052%22%20transform%3D%22scale(0.000587889)%22%2F%3E%0D%0A%3C%2Fpattern%3E%0D%0A%3CclipPath%20id%3D%22clip0_222_9052%22%3E%0D%0A%3Crect%20width%3D%22362%22%20height%3D%22127%22%20fill%3D%22white%22%2F%3E%0D%0A%3C%2FclipPath%3E%0D%0A%3Cimage%20id%3D%22image0_222_9052%22%20width%3D%221701%22%20height%3D%221701%22%20preserveAspectRatio%3D%22none%22%20xlink%3Ahref%3D%22data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAABqUAAAalCAYAAAC2TsKjAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAGpaADAAQAAAABAAAGpQAAAABDhyXtAABAAElEQVR4AezZQQkAIBQFQbV%2FKJupYIa9jQH8MLzbzvPe8AgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAh0Ant1f%2FuZAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBcQpSyBAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKByds4AAAQABJREFUiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIECAAAECBAgQIECAAAECBHIBUSondoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQECUsgECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFcQJTKiR0gQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQpWyAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgFxClcmIHCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIERCkbIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQyAVEqZzYAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAVHKBggQIECAAAECBAgQIEDgsnd%2FwVVUaaP%2F11EYEiUxCQNoNgYEzsA5jJVMieiFVfjnN295J7yeK2vQUHOHjjIXU2PpWyNYL3Ocmgt1XvHOAoe3vHIKuKPmd1Qop2o4EWvCi8yAP4KQYW8G0CQm0QQCzK%2BfHRvyZ%2F%2Ft7tW9%2Fny7KpVk7%2B7Va31W00A%2F%2B3kWAggggAACCCCAAAIIIICAdgGCUtqJOQECCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggABBKa4BBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAAB7QIEpbQTcwIEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAGCUlwDCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAAC2gUISmkn5gQIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIEpbgGEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEtAsQlNJOzAkQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQISnENIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIaBcgKKWdmBMggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggQlOIaQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQ0C5AUEo7MSdAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBAgKMU1gAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAgggoF2AoJR2Yk6AAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCBAUIprAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAQLsAQSntxJwAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEECAoBTXAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAgHYBglLaiTkBAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAQSmuAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAe0CBKW0E3MCBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABglJcAwgggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAtoFCEppJ%2BYECCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACBKW4BhBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBLQLEJTSTswJEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEECEpxDSCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCGgXICilnZgTIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIEJTiGkAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEENAuQFBKOzEnQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQICjFNYAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIKBdgKCUdmJOgAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAgggQFCKawABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQEC7AEEp7cScAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAgKAU1wACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggIB2AYJS2ok5AQIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAEEprgEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAHtAgSltBNzAgQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAYJSXAMIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAALaBQhKaSfmBAgggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAgSluAYQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQS0CxCU0k7MCRBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBAhKcQ0ggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAghoFyAopZ2YEyCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCBCU4hpAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBDQLkBQSjsxJ0AAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEECAoxTWAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCgXYCglHZiToAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIEBQimsAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEBAuwBBKe3EnAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQICgFNcAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIICAdgGCUtqJOQECCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggABBKa4BBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAAB7QIEpbQTcwIEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAGCUlwDCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAAC2gUISmkn5gQIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIEpbgGEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEtAsQlNJOzAkQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQISnENIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIaBcgKKWdmBMggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggQlOIaQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQ0C5AUEo7MSdAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBAgKMU1gAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAgggoF2AoJR2Yk6AAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCBAUIprAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAQLsAQSntxJwAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEECAoBTXAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAgHaBOdrPwAkQQAABBBBIWeDMwFjxjDO%2Ffz12TQ2NTdzozZmB8Rs%2F1%2FPDsraGG7u3NM5VdzTeWvx9WVtj8XtL4xwlr09%2B8VftDSx%2BQAABBBBAAAEEEEAAAQQQQAABBBDwWoAnZV5PP4NHAAEE7BKQIFP4dTYIKA2NXS1%2Bha8NzQg6mTI6CWKFASoJWEnwSr4vDV4Pf17WdlvxNVP6TD8QQAABBBBAAAEEEEAAAQQQQAABBBBIWoCgVNKitIcAAgggEEtAAkwHTw0oyWrqzY%2FcCEJFzWqK1ZmEDp7se%2FWsLAlcSQBr8quxGLDqzM0vBqu6cs0J9YZmEEAgSwG5x0XZwkzMKMdyDAIIIIAAAggggAACCCCAAAKmCPy3fwabKZ2hHwgggAAC%2FgjIg1kJOh0NvuT7ZACqeuDGH6HZI%2B3KNX0XoGpS61e23ghWSdYVGwIIpCsg9zApBypBZ%2Fku2Zth8HzyPcnknCwXGr6eZA%2BnlhENA1Y3S4dKCdHJMqJSXjR8X76HPyfZF9pCAIFoAiNXr6vhiWsqH9wr8kH29%2Bi1a8Hv11Vh%2FGqxQXl9cp%2FrN05QGL9ZhvjGiyV%2BaG%2BYW3y1ee4tqmnO5FLSueDDL%2FKzfMn7ueA%2B0Rz8nLvtezf2KdEULyGAAAIIIIAAAgggkKTAQYJSSXLSFgIIIIBASQF5QCvZT0fzo98FoEZvPKwteQAv1iUgwSp5QC3fJVglWVUEquoiZGcESgqEwXMJOEngXIJMLgTQw6xMuU9MBqomS4yGmZmUEy15OfAiApEEJKiU%2F%2FaK%2BtvIlSDYNFEMOJ0Yufxd8Km2AFOkE9d5kASvJFDV3jAnCFZNBqxWzZ%2Bn%2FkdzAwGrOi3ZHQEEEEAAAQQQQKCiAEGpijy8iQACCCAQSaA3P6wOnRoqBqIOBt%2FDbIFIjXFQJAF50NwVlP57eGWbkgfNBKoiMXKQJwIzg08SRNeR3WQTpwSu5B4igSsJeHfeyNQk6G3TPNLXdAUkANUz8G0x%2BNQTfCDnxHeBqHR7kfzZJGAlAarVTfPU%2Fa2NKhcErlYHwSo2BBBAAAEEEEAAAQQiCBCUioDGIQgggAACMwTCINS%2BYxeDLAKyoGbwGPOrPFh%2BOMikCrOpppb%2FMqaTdAQBzQJDQYksuWdJ5qYEn1zIfNJMNqt5uZeEwSq5n0xmarLu3SwoXnBe4MTwuPpkaDL4JEGoWkvruQAzM1C1ru02MqpcmFjGgAACCCCAAAII6BcgKKXfmDMggAAC7gnIQ919xy4Us6H2HbtEJpSlUywPluXriXsXFjOpCFJZOpF0u6JAGITaH9yrJAB18NRgxf15M7qABL0lS1O%2Bhxma0VvjSATME5A1nj68NBpkQ42pI0EwStZ%2FYrspEGZSSTYVQaqbLvw0W0AyCtkQQCB5AclilbUC2RBAAAHDBQhKGT5BdA8BBBAwRkAyCg4FD3PlgS4PdY2ZlkQ7EmZSSZBKyv6xIWCrANmbZsxcWAJQ7i2SUSX3Fda7M2Nu6EVtAlKO729BNtSHl75R%2B88PE4Sqje3GXhKcemzR7er%2BlkbK%2Fd1Q4YeTo5fVv%2F65HwgEENAgsHvtkmKZVQ1N0yQCCCCQpABBqSQ1aQsBBBBwTUACUZJdIGX5fF9fxbW5rTYeeZj88MoWteHeRcHD5LZiea5qx%2FA%2BAlkKcL%2FKUr%2F2c5OhWbsVe2YjIIGo%2F3NhtBiEkofnZEMlMw%2B54N8VEqR64q6mYhZVMq3Sio0CkiW1%2BdO8jV2nzwgYL0BQyvgpooMIIDApQFCKKwEBBBBAYLpA%2BGB3d895yvJNp%2FH6N3mQ3L2uPQhQtRRL%2FXmNweCNEeB%2BZcxURO4IGZqR6TgwQQEJRMmD8j39Q4pAVIKwZZoiQFUGxpOX9xWG1cvHL3gyWoaJQLoCf3zoHpVrnJPuSTkbAgggUL8AQan6zTgCAQQQcE9A1lx589BZtbunQEaUe9Ob%2BIhkzZgNQYm%2FZ9bdRYAqcV0arCZAIKqakN3vy3pUkwFwMjTtnkk7ei%2BBKErzZTtXYYDq2RULVHsDD1KznY10zr6nf1C9dvLLdE7GWRDwTICglGcTznARsFeAoJS9c0fPEUAAgXgCEojad%2ByCejfIiGKNqHiWPh8tAaruIDj1zLocJf58vhA0j13uV%2B8GQXMpJcr9SjO2Qc2HWVQEwA2aFAe6IllRvz87WAxGnRi57MCI3BmClPfb0N5c%2FHJnVIxkpsDOvq%2FU26cHZr7M7wggkIDAnx9ZoZrn3JJASzSBAAIIaBUgKKWVl8YRQAABAwXIMjBwUhzpEhkOjkykQcPgfmXQZGTcFQmAyz1GAlQPB%2BvcsSFQrwBZUfWKZbc%2F2VPZ2adx5pc%2F%2B4fad34kjVNxDgS8Ezj%2B4%2F%2Fu3ZgZMAIIWClAUMrKaaPTCCCAQAQBebi7%2FcBpsgwi2HFI%2FQJSfuuJoMTfhnsX1X8wR3gvIBlRbx7q537l%2FZVQGiAMUL2w%2Fm5KiJYm4tUpAhKMkqyMTwbHprzKj7YIPLrwdrWpo0Wta7vNli7TzyoC3UfO8eexihFvIxBFoCnIkDocZEqxIYAAAhYIEJSyYJLoIgIIIBBZIFwr6o1Df1dDYxOR2%2BFABKIKUN4vqpx%2Fx3G%2F8m%2FOkxix3GO2ru8IguCLKCGaBKhDbewrDKs9%2FUOKEn1uTKpkT21Z3kZpPwemk6CUA5PIEIwUWN00T%2F3hwQ4j%2B0anEEAAgRkCBKVmgPArAggg4IQAD3edmEbnBiHZU5Tecm5aYw%2BI%2B1VsQhr4TiAsISoBqpbGObh4KBCuF7U%2FKA2W58M4Tl4BBKfsn9Z%2F%2BfiMyo%2FzYTn7Z5IRmCYg6%2FLtXrvEtG7RHwQQQKCUAEGpUiq8hgACCNgqcGZgPCjR16d29xRsHQL99kBAMhu2Pb68mNnAg2MPJrzMEAlGlYHh5dgCLUFGxYagfChB8NiUVjUgmVFSpo9glFXTFrmzBKci02V%2B4Jr%2F9%2F%2FLvA90AAEXBaTU6YurFro4NMaEAALuCRCUcm9OGRECCPgowHpRPs66%2FWMO14V55fEVlN2yfzrrGoGsF7UtWOOOsqJ1sbFzBIEwCL5%2BZRv3mQh%2BNhwia0b9218vEoyyYbI09JHglAZUjU1KNuODH%2FVpPANNI%2BCvwC9%2F8H319NJWfwEYOQII2CRAUMqm2aKvCCCAwEwBMqNmivC7rQJS2o%2FglK2zV3u%2FJYD%2B872fq978SO0HsScCCQiE2VPcZxLANKQJCUZJZtQng2OG9IhuZCkga6n8R1e7am%2BgdGeW81Dt3CdHL6t%2F%2FXN%2Ftd14HwEEIgj8rvMu9dii%2BRGO5BAEEEAgdQGCUqmTc0IEEEAgAQGCUQkg0oSRAgSnjJyW2J2Se9bm9z5TB08Nxm6LBhCIKxCuPfVMEAxns0%2BgEKxF89rJS%2BqDi9%2FY13l6rF1gQ3uzenbFAoJT2qWjnUCCyZs%2FzUc7mKMQQKCiwB8euFutbm6ouA9vIoAAAoYIEJQyZCLoBgIIIFCTAGuw1MTETg4IyEPjV4J1px4OSm6x2SvAPcveufOh55T2s2%2BWd%2FZ9pf7z70NqeOK6fZ2nx6kJSEm%2Fn9x9B2WsUhOv%2FUQfXvpG%2FayXtW9rF2NPBGoXOP7j%2F177zuyJAAIIZCtAUCpbf86OAAII1C7AGiy1W7GnOwJkTtk7l1Kqb%2FN7f1VnBiitZe8s%2BtFzSvuZP8%2BsG2X%2BHJnYQwlO7V67hKwpgyZnT%2F9gkOn4pUE9oisIuCEgJUz%2F8GCHG4NhFAgg4IMAQSkfZpkxIoCA3QI82LV7%2Fuh9MgIEp5JxTKMVyY7afqBPvXGINSPS8OYcyQpwr0nWM25rI1evK8mO2tM%2FFLcpjvdYYMvytmJJP48JjBm6%2FHmWteDYEEAgWQEpXbpjzeJkG6U1BBBAQJ8AQSl9trSMAAIIxBOQNVh%2Bvvek2nfsYryGOBoBhwR4YGz2ZBJEN3t%2B6F3tApQQrd1K155kR%2BmS9bNdsqbMmPeXP%2FuH2nd%2BxIzO0AsEHBKQgJQEptgQQAABSwQISlkyUXQTAQQ8E6BUn2cTznDrFtgWrDf1wvqlqqVxTt3HcoAeAQmikx2lx5ZWsxPoyjWpres71DPr2rPrhGdnJjvKswlPebhkTaUMPuN0zx8tqA8ufjPjVX5FAIG4An944G61urkhbjMcjwACCKQlcPCWtM7EeRBAAAEEqgtIlsGPfntYbQ0e7g6NTVQ%2FgD0Q8FRg24HTno7cvGFLVucjbx0hIGXe1NCjBAR68yNqd08hgZZoohYByY568nA%2F5fpqwWKfSAJSOk6uscL41UjHc1A8geGJ6%2FEa4GgEEJgl0DTnFgJSs1R4AQEETBfg48WmzxD9QwABLwRYg8WLaWaQCQosa2skSypBz6hNSSB94zv%2FRRA9KiDHWSEg2VJs%2BgVeO3mJYJR%2BZs4QCJwYuay6j5xTkjVFuat0L4lCsO4kGwIIJCtwf2tjsg3SGgIIIJCCAEGpFJA5BQIIIFBJgDVYKunwHgKlBZa1UZ6itEx6r24%2F0KfIWEvPmzNlJ7B%2BZWt2J%2FfgzIXxCfXSZxfUJ4NjHoyWIZoikA8qErx8%2FIKS78%2BuWGBKt5zvx8i1a86PkQEikLbAY4vmp31KzocAAgjEFiAoFZuQBhBAAIFoAmRHRXPjKAREgMyF7K4DuXf9fO%2BJoKTZ%2Bew6wZkRSFGAILg%2BbFlb5t%2F%2B%2Bg9FSS99xrRcWUDK%2BUlA9Nc%2FvFO1N%2FB4pLJW%2FHf5sx7fkBYQmClwf%2BttM1%2FidwQQQMB4Af7VZfwU0UEEEHBRQNZg2fhOr5K1KtgQQKB%2BAR4S12%2BWxBHcu5JQpA3bBLpyzbZ12Yr%2B7uz7SklAgA2BrAUkKCXl%2FHavXUJgSuNkSFYaGwIIJCuQa5yrco082k1WldYQQCANgVvSOAnnQAABBBC4KfDmoX71o98eJiB1k4SfEKhboJOHxHWbxT1AAlKPvHWEe1dcSI63SoCszOSna%2BTq9WIAgIBU8ra0GF1AAib%2F%2BuezlJGMTlj1SIJSVYnYAYG6BR5deHvdx3AAAgggYIIAQSkTZoE%2BIICAFwJS8mrjO0fV1r0n1RCfFPRizhmkPgEeFOuzLdWyZHVKMP3MAGu%2BlPLhNXcFyMpMdm5l%2FagnD%2Ffz4D9ZVlpLSCAMmP7%2B7GBCLdIMAgggoFeA9aT0%2BtI6AgjoEyDHU58tLSOAAAI3BOSBrgSkeKB7g4QfEIgs0BKUqJAvtnQE9h27qDa%2F91eC6elwcxbDBB5e2WpYj%2BztTs%2FAt%2BqF%2FzrP%2BlH2TqE3Pf%2FN518qCVA9u2KBN2NOY6CF8atpnIZzIOCNgJTuu7%2B10ZvxMlAEEHBLgCc6bs0no0EAAQMFpFyfZEexIYBAMgJkSSXjWEsr7%2FYUVPd7x2vZlX0QcFKAUqHJTOue%2FkH12skvk2mMVhBIQSAsL0lgKjlsyvclZ0lLCIgApfu4DhBAwGYBglI2zx59RwABowWkXN%2FP955Qu3vOG91POoeAbQJkSaUzYwSk0nHmLGYLEASPPz87%2B75S4QP%2B%2BK3RAgLpCYTXLYGpZMwl%2B4wNAQSSE9jUQTZ3cpq0hAACaQsQlEpbnPMhgIAXAmcGxoNyfb1KyvaxIYBAsgI8JE7Ws1RrBKRKqfCabwKUCo0%2F4y99dkHtPz8cvyFaQCAjAQJTycGPTFxLrjFaQsBzASnbl6OcuedXAcNHwG4BglJ2zx%2B9RwABAwVYP8rASaFLTgl05pqcGo9pgzl4aoCSfaZNCv3JRIAAeHR2yYj4WW9BfTI4Fr0RjkTAEAECU8lMRJ41pZKBpBUEAoEN7c04IIAAAlYLEJSyevroPAIImCZAdoFpM0J%2FXBRY1tbg4rCMGNNkUP2%2FjOgLnUAgawGCUtFmQAJS3UfOqRMjl6M1wFEIGChAYCr%2BpIxSvi8%2BIi0gEAjkGucSlOJKQAAB6wUISlk%2FhQwAAQRMEdh%2BoE9tO3DalO7QDwScFejK8clAHZM7WXb0qBoam9DRPG0iYJ3A%2BpWs1VDvpBXGJ4KAVF7luY%2FUS8f%2BFggQmIo3ScMTrCkVT5CjEZgUeHTh7VAggAAC1gsQlLJ%2BChkAAgiYILD5vc%2FU7p7zJnSFPiDgtACZC3qmVwJSj7x1RJ0ZoNSWHmFatVGArMz6Zo2AVH1e7G2ngASmmubcop5eStC63hnMB0FrNgQQiC%2BwqYP7T3xFWkAAgawFbsm6A5wfAQQQsFlgaOxq8UEuASmbZ5G%2B2yTQwoK%2BWqZr4zu9BKS0yNKozQJkZdY%2BewSkardiT%2FsFfvP5l6yXVuc0SllPNgQQiC8ga0nl%2BP9QfEhaQACBzAUISmU%2BBXQAAQRsFQgzCw6eGrR1CPQbAesEyJRKfsp%2BvvekkrWk2BBA4KYA95qbFtV%2BIiBVTYj3XRT4WW9BFcavujg0LWOS%2BwQbAgjEF9iyfEH8RmgBAQQQMECAoJQBk0AXEEDAPoEwIMWDXPvmjh7bLUA5rWTn781D%2FeqN4IsNAQSmC3Cvme5R7jcCUuVkeN11Acn86T5yTg2TAVTTVH995VpN%2B7ETAgiUFyBLqrwN7yCAgH0CBKXsmzN6jAACGQuEASnWXsl4Iji9lwKduWYvx61j0HIv2xpkSbEhgMBsgYdXsl7DbJXpr0w%2BlM%2Br%2FBgZENNl%2BM0XAbn2nw8yptiqC4xe%2B2f1ndgDAQTKCjTPvUWRJVWWhzcQQMBCAYJSFk4aXUYAgewECEhlZ8%2BZERABSmolcx2E97JkWqMVBNwTIABeeU7DLBECUpWdeNd9gU8Gx9RrJy%2B5P9CYI8yPXYnZAocj4LfApo5W1pLy%2BxJg9Ag4J0BQyrkpZUAIIKBLIHyIS4aULmHaRaCyQEuwqK98scUX2H6gT3Evi%2B9IC%2B4KEACvPLf%2F%2B8QldWLkcuWdeBcBTwT29A%2BpDy5%2B48loow1zeOJ6tAM5CgEEgmDU3CBLqg0JBBBAwCkBglJOTSeDQQABXQIEpHTJ0i4CtQvwkLh2q0p77u4pKPliQwCB0gIEwEu7hK9KVsj%2B88Phr3xHAIFA4OXj%2F1CF8atYlBEoUOazjAwvI1BdgIBUdSP2QAAB%2BwQIStk3Z%2FQYAQRSFiAglTI4p0OgjABZUmVg6nhZ7mfbD5yu4wh2RcA%2FAQLg5ed8Z99XSrJC2BBAYLqAlLR86bN%2FTH%2BR324I5AnY3bDgBwTqEdjQ3qzkiw0BBBBwTYCglGszyngQQCBRAQJSiXLSGAKxBHhQHIuvePDP956kbF98RlpwXIB7TekJ3tM%2FqN4%2BPVD6TV5FAAEl60v9%2FuwgEggggEAiApNl%2BxYk0haNIIAAAqYJEJQybUboDwIIGCNAQMqYqaAjCBQFOnNNSMQQkJJ9%2B45djNEChyLghwD3mtnzLOtHvXbyy9lv8AoCCEwTkMAtZfymkRR%2FKYxR2nC2Cq8gUFlAyvblWE%2B3MhLvIoCAtQIEpaydOjqOAAI6BYaC%2Fzg98tYRMgp0ItM2AnUKLGtrqPMIdg8FKNsXSvAdgeoCy9oaq%2B%2Fk0R6F8Qn1%2FNHzHo2YoSIQXYAyfqXt8sF9hA0BBGoXoGxf7VbsiQACdgoQlLJz3ug1AghoFiAgpRmY5hGIINCVo556BLbiIdsP9BFkj4rHcd4JPLyy1bsxlxuwPGDvPpJX%2BTEeKJcz4nUEZgpQxm%2B6iNxH2BBAoHYByvbVbsWeCCBgrwBBKXvnjp4jgIAmAVlzpTc%2Foql1mkUAgSgCrPESRW3yGMmSktJ9bAggUF2Ae810o9dOXiIgNZ2E3xCoSYAyfjeZhieu3fyFnxBAoKrArvuWULavqhI7IICA7QIEpWyfQfqPAAKJCkg2wRuH%2BhNtk8YQQCC%2BQAv11CMjSuYnGwII1CZAmdCbTjv7vlL7CsM3X%2BAnBBCoWUCyg%2F73CdZxFDAyLWu%2BbNgRAfXiqoUEpLgOEEDACwGCUl5MM4NEAIFaBN4MglHbDpyuZVf2QQCBlAXIXogGLhlSZwbGoh3MUQh4KMC9ZnLST4xcVpLpwYYAAtEFPrz0jZJSfr5vo9f%2B6TsB40egJoFnVyxQmzpaatqXnRBAAAHbBQhK2T6D9B8BBBIRkHJ9W4OyfWwIIGCmANkL0eZlO4H2aHAc5a3A%2BpVt3o49HHhhfEI9f%2FR8%2BCvfEUAghoBkHPq%2BUb7P9yuA8dcisKG9WW1Zzr9BarFiHwQQcEOAoJQb88goEEAghoCst7LxnaMxWuBQBBDQLdCZa9Z9CufaJ0vKuSllQCkIEABX6qXPLlBuK4VrjVP4ISCZUr6XwaR8nx%2FXOqOMLrC6aZ7asWZx9AY4EgEEELBQgKCUhZNGlxFAIDmBobGrStZbobxVcqa0hIAOAUpq1a9KllT9Zhzht4CsXbesrdFrBMnqoNyY15cAg9cgIKUwh4M1pnzdZH0tNgQQKC0gAalda5eUfpNXEUAAAYcFCEo5PLkMDQEEqgv8PCjZR0CquhN7IJClgDwoli%2B22gXIkqrdij0RCAV8D35L2T7WkQqvBr4jkJyAZArtOTuYXIOWtST3FjYEEJgtEAakmufwaHa2Dq8ggIDrAtz5XJ9hxocAAmUFth%2FoU%2FLglg0BBMwW8P1BcZTZIUsqihrH%2BC7g871GMhm6j%2BR9vwQYPwLaBPb0D3mbLTU8QaaUtguLhq0VuL%2B1sZghRUDK2imk4wggEFOAoFRMQA5HAAE7BQ6eGlDbDpy2s%2FP0GgHPBHwvp1XvdJMlVa8Y%2ByMwKdCZa%2FKWQsr2se6Lt9PPwFMQkMCvr9lSo5TvS%2BEK4xQ2CWxob1a7g5J9BKRsmjX6igACSQsQlEpalPYQQMB4gTMD42rze381vp90EAEEJgW6cvOhqEOALKk6sNgVgSkCvgbA9xWGlWRxsCGAgF4BX%2F%2Bc5Snfp%2FfConWrBJ5dsUDtWLPYqj7TWQQQQECHAEEpHaq0iQACRgtsfu8z1pEyeoboHALTBZa2NU5%2Fgd%2FKCkgWKOvkleXhDQQqCvhYvo91pCpeEryJQKICki0lQWDfNsr3%2BTbjjLeUQPPcW9Svf7hYbVneVuptXkMAAQS8EyAo5d2UM2AE%2FBaQdaQOnvJ3oWG%2FZ5%2FR2yqwrK3B1q6n3u93e86nfk5OiIALAhKQammc48JQ6hrDzr4ByvbVJcbOCMQT8C0oRVnQeNcLR7shkGucq95%2FYKl64q5mNwbEKBBAAIEEBAhKJYBIEwggYIdAb36EdaTsmCp6icA0ga4c%2F4GbBlLmFylNKutJsSGAQP0CPga%2F5eG4bw%2FI678yOAKBZAU%2BGRxT8uXLNnrtui9DZZwIlBTY1NGq3n%2BwQ%2BU8%2FOBLSRBeRAABBL4TICjFpYAAAl4IyMPaje8c9WKsDBIBlwR8LKcVdf6kdB8bAghEE%2FDtXiNlxN4%2BzT0j2tXCUQjEE9jZ91W8Biw6%2Busr1yzqLV1FIDkByY7avXaJenHV91XzHB69JidLSwgg4IqAfzUqXJk5xoEAAnUJSNk%2B1lmpi4ydETBCwMfshajw2w%2BcjnooxyHgvUBnUL7Pp%2B33Zwcp2%2BfThDNWowQkU2o4CAz78KC6MH7VKHs6g0AaAs%2BuWKB%2B0tHixZ%2FxNDw5BwIIuClAuN7NeWVUCCAwRUDKWVHSagoIPyJgkYBv2QtRp6Y3P0rgPSoexyEQCPgUAC%2BMT5AlxVWPQMYCe4LAsA%2FbyFUypXyYZ8Y4KXB%2Fa6P640P3qC3L2whIcVEggAACVQQISlUB4m0EELBbQMr2kT1g9xzSe78FfMteiDrbbx46G%2FVQjkPAe4GWYJ0Hn9au%2B1nvee%2FnHAAEshb48NI3WXchlfMPT7CmVCrQnCRTAQlGSak%2B%2BWLtqEyngpMjgIBFApTvs2iy6CoCCNQvQNm%2B%2Bs18PaIlqPvd0nhrTcOXYCdbOgIyL2zVBQ6e8uMT19UlzNlDMm8k0CEBDwmuyvdlbY3FL%2BllrZk54f0mLEEr34fGrqqzwXd5b2hsopglF%2B5njoA9PfEpI3NfYVidGLlsz%2BTQUwQcFZA%2Fh1LGTx5mu7wVgr%2Bj2BBwVUD%2B%2FEqpPtf%2FHLs6f4wLAQSyFSAola0%2FZ0cAAY0ClO3TiGtR01MfDMvPS4OHwhLokJ8nA1Fzig%2BLowxJHgxPfk189%2F1q8eHw18WHxOPFn%2BX98MFxlHP4foxPD4ujzvXBUwPFay3q8RwXX0DuJV25%2BeqJexcF35uKXxKESmILg1fhd6Vayzbbmx8p3ovkuwSt5LuUdpTAFVt5AZ%2FuM2%2BfHigPwTsIIJCqwAcXR51%2FmJ1nTalUrylOpl%2Bgee4t6om7mtVji%2BY7%2F%2BdXvyZnQAABnwWS%2Bd%2Byz4KMHQEEjBSQIABl%2B4ycGm2dkge2kpWwfmVrMRNBHjLefIir57Ty0HnywXND1RNIcCp8YHw0P1x8UCwZD%2FIaW2mBm76l3%2BfVSYH9xy5BkYGABKK6191VDEQ9HNx3TNjC4MrM%2FoT3n0NBAFOCVHLfCTOvTOh31n3Q%2FXdF1uMLz7%2Bz7yuVJ0AZcvAdgcwFJHPxxVULM%2B8HHUAAgeoCkg312KLb1RPtd7BeVHUu9kAAAQSqChCUqkrEDgggYKMAZftsnLX6%2BiwPXeUB7PqVbUp%2BTiorob5e1L639C98ULzh3ukPICYfEI%2BryQfGZDaEquED9vB3vpcWoHRfaRcdr0og6uGVLeqF9Utv%2FHnWcZ6k2wzvP%2BE9SNqXQJVcO%2BF9x%2BfrqDP4QIPrW2F8Qv3n34dcHybjQ8AqgZGr150v4VcI%2Fq5hQ8BWAQJRts4c%2FUYAARsECErZMEv0EQEE6hKQLCkp3cfmlkCYlSBrs2wISmSZHoSqR1%2BCL%2FI1NVgVBqr2H7tYzGrwMaOKoFT1q0judz5eG9Vlkt1D7j8vrO9QW4MvV%2B49Mg6550y974RBKvnuU5DKh3vNzr4BNTxxPdk%2FGLSWqICUhJIHoO0Nc1Uu%2BPPZNOfW4Lv8XHptRcl6k6DG34bH1cnRy0EW3FXWC0t0RtJpzPUSfvkgIM6GgC0Cq5vmFe%2FD69puU2uD%2B3HznFts6Tr9RAABBKwTIChl3ZTRYQQQqCbwyFtHqu3C%2B5YIhIEoWadl6if8Lel%2BrG7ODFRNzWqQh8U%2BBCJ8KakV50KR9aTY9ApIMGrb4yucCUZV0pL7rHy98t1Ocq%2BRwLjL9xy517oSaCw3t5IlJWXC2MwSkOCTlIKSh6DyALS9ob7%2Fmof7P7rw9hsDGw6CVCdHLhfn%2B5PBMco13pAx94cPL33jbAk%2FCZqyIWCigHwIQO7Bcv9d3fS94KtBrQp%2BJghl4mzRJwQQcFWgvn%2F5uqrAuBBAwBmBNw%2F1s06G5bPpcyCq0tTNzGqQ9WAmHxhfKn4fcnCdEB9KalWa81reYz2pWpSi7SPBitc3rvIuID5VKwxSyWuu3nN8CH5LlhSbGQLyAPSxRfPVhvbmuoNQtYxAHqhKtpV8ySaBKQlIEqCqRS%2BbfSTjTbLcJDvOtU0C4myVBSQ4smr%2BvMo78W7dAuIq2aaySQA%2F%2FF3uwc1zb9Vy%2F627kxyAAAIIeC7g3r98PJ9Qho%2BAzwJSxuqNICjFZqeAPAB%2BZl276g6%2BXP%2FUehIztKytMbCSr%2FZic2FGw75jl5wJzLY0Tv5nMgkvV9uQeWdLXkCyo94IAlJsNwVm3nPkXhNmUUnAytZN%2Fu5xeSNLKvvZlYehT9zVXAxGhcGitHoVBqgkg%2BrDi6Pq7dMDZE%2BlhV%2FHeT64OKKeXtpaxxF27Pr1lWt2dDTDXsq94cVV09eazbA7nBoBBBBAAIHUBAhKpUbNiRBAQLfA9gN9zjyM121lUvvFUlFBaSz5zhZdIMxokMwOKe0nwYp3g7XVbC7z15Vrjg7iwZG9%2BVHlYoZc1lO366kfBsHeu7LuhvHnn7oeVXi%2Fke%2B2BahknUKXN7KksptdCUZt6mhVP%2BloybwklGRQSXaWfEnmFMGp7K6LUmeWTDYXg1Kj1%2F5Zari8NkUgLMM55SV%2BRAABBBBAwAsBglJeTDODRMB9AcmS2h08gGezR4BglL65kk%2F%2By9fWINtDHhBLWUvbMqhcz15IYvYPsZ5UEow32pDSoXt%2F2kmA%2FIZI7T%2BEQXE5wrYAlcvl%2B2Q9F9aSqv06TmpPk4JRpcYkgSkpIbinf0jt7Puq1C68lrKABKVc3PJjV1wcVqJjygX%2F9mBDAAEEEEDARwGCUj7OOmNGwEGBze995uCo3BwSwah051VKbkn2lHzZ9LDY5QfFSV0BMp9syQnseup%2FEpBKgHNqgEo%2BLCLrnu07djGBlpNvQkrFupyR2RRkx%2FzxoWXFrBiCU8lfPzNbND0YNbW%2Fcm1sWd4WlBVsUps%2FzVPSbypOBj9LAPnE8Lha3dyQwdn1nXJ44rq%2Bxh1pWdY3YkMAAQQQQMBHAYJSPs46Y0bAMQF56MXDWfMnVTJfJDAiDyzZshGY%2BbBYyvuZ%2BmeHTKnq14htZdKqjyi7PeTetOHeRdl1wNEzy5p38iXXqtxrth84bVR5Px%2FuM%2FIp%2FB1rFhcDEFKyjeCUnj9ssnbTjjV3qlwQ6LRpk%2BsjDFySNZXtzPUE2VKuBaUKYxPZolpw9vYGMqUsmCa6iAACCCCgQcCufzVrAKBJBBCwX0AecrGZKyAlsV55fHmxlJy5vfSvZ1MfFsufIXlgbFKQw%2FV1XuJecUNjV61eLyzu%2BJM8%2FoWgzKWUumTTJyAZm93r5Ku9eN2GJUWzXhPNh6BUOKtTg1P7z48Ug1N5HhiHPJG%2FS3bUv%2F%2FPO4NyeLdHbsOEAyVrSta2%2Bc3nlxTZLdnMyMlR90rdjVwjU6ra1WRbILvaeHgfAQQQQACBWgUIStUqxX4IIGCkgGRJmfQg3UikDDslmQevb%2FyBkgeSbGYKyNzsempNsXPy58mU7CkJZrKVF%2BjND5d%2Fk3dqFpDrf9vjK2renx3jC0ggSO45rweBVSnrl2X2lI9lQiU4JQEI%2BZKsKcmeIjgV7bqWQNS%2FB9lRzUEpPBc2WWtKMr4o55fNbLq4rhQBzsrXkpTRZEMAAQQQQMBXAf4W9HXmGTcCjgiQJWXmREpAYe9PO4tfBKTMnKNSvZIsho%2BeW6v%2B8osHixkNpfZJ6zWfMhiimB7Nj0Y5jGNmCEgWp6wrxJa%2BgLjLPeeLXz1UvO%2FIz2lvnbnmtE9p1PkkCCGl26S8nwSr2GoTkOyoF1ctVL%2FrbHcmIBWOXK6DXffluB5CkBS%2FS3B4OFhbyqWtEHz4gK28APfd8ja8gwACCCDgvgBBKffnmBEi4KwAWVJmTq2sW%2FSXXzzA%2BixmTk9NvQozGeRhsTwoTjuwKA%2BrCRRUnipT1wKr3Guz3pXrOotAiFkKZvRG%2Ft6Q7Cm557ywfmlq9xyC35PzPzU4JZkybOUFJoM2S9SmjpbyO1n%2BDoGp7Cbw5Mjl7E6u4cwj165paNWdJsmUcmcuGQkCCCCAQP0CBKXqN%2BMIBBAwRIAsKUMmYko3Xt%2B4qviJ97SDGFO6wI8JCsg8yoPij567r%2Fg9rXnlQXH1Scx6LZ7qPTR%2FD8mSYjNLQO4xbwQlXyU4Jfcenfccuc8Q%2FJ4%2B%2FxKc2r12SfHL9jWSpo8smd8kYPf%2Bgx1qddO8ZBo0uBUCU9lMzt%2BGx7M5saazUr6vMiyZUpV9eBcBBBBAwG0BglJuzy%2BjQ8BZAbKkzJpaeXAoJd%2B2ru8wq2P0JhEBmd%2BwzJbuB8XSYYJS1aetl%2FJ91ZEq7BFe0xV24a2MBabecySTKunNx%2FWkajWU4IuUppPSfhKoYlNBZlRrMVjnyvpRtcxpGJiScoVs6QicHL2SzolSOAtr1VVHbm%2BgfHB1JfZAAAEEEHBVgH9hujqzjAsBxwXIkjJngiWAIJk0BBLMmROdPZn6oFhXFgMPiyvP4FCwRgOZUpWNqr2rI8hR7Zy8H01A7jmy1p18yc9JbfydVV1SghKy3pTvwalnVywI1pD6fnUwB%2FeYvAbudHBkZg7phEPl%2BwhKVb%2FGKN9X3Yg9EEAAAQTcFSAo5e7cMjIEnBUgS8qcqX3mu4eFuoIT5oyUnswU0Bmc6szxyfyZ3lN%2F780PT%2F2VnyMIyL2LzS6BqetOJRGc6gw%2BUMFWm8DU4NTTS1uV%2FO7L9usfLlZblrf5MtyS43x04e1K5p1NvwCBHP3GJp3Bp3upSe70BQEEEEDADAGCUmbMA71AAIE6BMiSqgNL466vPL5C7Q7W%2FGBNDo3IFjStIzjV0nirBSPProtfj7FweBx9uWeRKRVHMNtj5UMQUkZU1p2KE5wiI7P%2BeZQHqL%2F8wffVrvtyxQwq1x%2BoSkDqibv4kIRcKTLvUtaRTa%2FAyNXrKh9kQ7uwFcbdGIfOuWiey793dfrSNgIIIICA2QIEpcyeH3qHAAIzBMiSmgGS0a8SkNr2%2BPKMzs5pTRQIg1NybcTNnOsiU6riFJMpVZGn6puUbatKZMUOcYJTEpjkPhN9miUYJWtNSVk%2FKe%2FnYnCKgNTs60PmmvWlZrsk%2FcrIhBvBHLK%2Bql8Z7Q3%2BZJ1W12APBBBAAAHfBAhK%2BTbjjBcBywXIksp%2BAl%2FfuIqAVPbTYGwPJFgpa4xFzWAgYFB9amVNKbboAlxj0e1MPDJKcIprILmZdDE4RUCq9PUhwcef3N1S%2Bk1eTUzgxOiVxNrKsiHJ%2BmKrLJALPiDBhgACCCCAgK8CBKV8nXnGjYCFAvuPXVJnBsYs7Lk7Xd711A%2FV1vUd7gyIkWgRiPKQOOwIJbVCifLfzwyMl3%2BTd6oKcI1VJbJyh6n3nWrlGQlKJdrubCoAAEAASURBVD%2FFYXBq99olVpd5e3HVQkr2Vbg8fFtTrAKFtreGJ9wo0TviyDh0TXTTHB7F6bKlXQQQQAABOwT4m9COeaKXCCAQCLxx6CwOGQpIWbbudXdl2ANObZtA%2BJD4o%2BfW1lzSj4fF1Wd5aGyi%2Bk7sUVagJfi0P5u7AnLfkXuOrDslP5faCEyWUknmNVl3SAJTUtpPAlU2bc%2BuWKA2dZAJVGnO5EG6BO7Y9Am4shZTnjWlKl4kLpY9rThg3kQAAQQQQGCGAEGpGSD8igACZgpIZsDBU4Nmds6DXrGGlAeTrHGIkrXwxa8eqviQODx9Z64p%2FJHvZQQo31cGpsaXl5YJVNR4OLtZIhCuc1cqONXJunXaZ1EeuMoaRLYEpyQgtWV5m3YXF07w6MLbrc6GM30OXCl7N0r5voqXGplSFXl4EwEEEEDAAwGCUh5MMkNEwAWB7Qf6XBiGlWMgIGXltBnZaXlIXG29KTIYqk8d5fuqG7EHAqFAGJySv8vCLDkyMkMd%2Fd9nBqdMzA54bNHtBKTqvBQkiMemRyDvSDb08ARrSlW6Qky8F1bqL%2B8hgAACCCCQtABBqaRFaQ8BBBIXkAewu3sKibdLg9UFXgjWj9r2%2BPLqO7IHAjUKhCX9JHOqVGmtZW231diSv7tRvs%2FfuWfk0QXk77K%2F%2FOKB4O80CU6xuHx0yWhHhsGpXfflihlUpjyQlX78%2B5o7ow3K46OkTGPzXB4l6LgE3CnfR6nhStdHewN%2FD1Xy4T0EEEAAAfcF%2BJek%2B3PMCBGwXuDgqQHrx2DjAOST5G9sXGVj1%2BmzBQISkJpZ0k9e42GxBZNHFxGwVEDuMa%2FwQYtMZ0%2BCQLLWlJT1k%2FJ%2BWQan5Ny77luimoN1ktjqF%2FjJ3ay%2FVb%2BaH0e4UoJQ52xRvk%2BnLm0jgAACCNggwL%2FAbZgl%2BoiA5wLbD5z2XCD94cuDu70%2F7Uz%2FxJzRO4GpJf0o3Vd9%2Bs8MjFXfiT0qCpzFsKIPbyKQlkDWwalf%2FmBhEBQjWyHqfD%2B9tDXqoRxXQcCF8n2FcbKkKkxx8a0sA%2FLV%2Bsb7CCCAAAIIpCHAv8LTUOYcCCAQWUCypHgIG5kv8oESkJLAFBsCaQjItbbrqTWqNz%2BSxuk4h%2BcClD%2F0%2FAJg%2BMYJSHBKvj4ZHFM7%2B74qftfdSVkTSdaSYosuIJkeUsZP5o0NgakCX1%2B5NvVXfi4h0Dz31hKv8hICCCCAAAL%2BCJAp5c9cM1IErBR4t%2Be8lf22udOyGDyLwNs8g%2Fb2nevO3rmzqeeyTiEbAgiYJyABjt1rl6g%2FPNhRDFLp6qGcZ8vyNl3Ne9UugT09050fu6qn4ZRaHb32z5TOZO9p2hvm2tt5eo4AAggggEACAgSlEkCkCQQQ0CMgDw539xT0NE6rJQWklJosBs%2BGAAIIuCowZPnDPlfnhXEhEAqsbppXXG9K1p2SDKokNymZtWPNnUk26XVbG9rv8Hr8DL60QH7sSuk3ePWGAKVDb1DwAwIIIICApwIEpTydeIaNgA0CUrqPLT0BFoBPz5ozIRBVgHKmUeVuHnfw1ODNX%2FgJAQSMFZgMIC1WYXCqeW78%2F7pKhhQPg5ObcinhlyPjIzlQR1oanrjuyEj0DEP%2B3LAhgAACCCDguwBrSvl%2BBTB%2BBAwWePNQv8G9c69rrwQZUqwj5d68MiIEEJguIIE9yZZqaeSfwdNl%2BA0BMwXC4FR%2BrE3tPz%2Bi9hWGVX5sou7OhmtX1X0gB1QUeDRYm2tP%2F1DFfXjTL4FChD%2BfPgnJPc3FTe7LIxPX1N9GJjPlRq9dU2GAMixXKB8uKAazAwNXHVycW8aEAAII6BDgf%2BM6VGkTAQRiC0jpvt78SOx2aKA2ASnbJ19sCCCAgA8C%2B49dVM9wz%2FNhqhmjQwLyAFMyneRLAlNvnx6oOTg1eewChzTMGYqUW2RDYKpAftzuNbGmjkXHzy5kSkkAqif4kM%2FJ0cvqk8ExVRifuBGAqsdM7h%2FiIWv9yc%2B5hjlqdXNDPU2wLwIIIICApQIEpSydOLqNgOsC2w%2F0uT5EY8ZH2T5jpoKOIIBASgJSwo%2BgVErYnAYBDQJh1lOtwSnK9mmYhO%2Ba%2FB%2FNBKX06dKyiwK2Zgj1DHxbDEDtK4wUg1BJzM2JkcvFZiSwFW6STbW2pVGta2tU9wffCVKFMnxHAAEE3BIgKOXWfDIaBJwRYM2P9KaSsn3pWXMmBOIKUGIzruDk8fuCTKnXx1ZRwi8ZTlpBIDOBqcEpCVBNfbAZdurRhbcr2Y9Nj8Cq%2BQSl9Mja22ohKJHLVl6gPcgGsmUbuXo9yEz9Wn1w8ZuS91cd45CSfx9e%2Bqb4Je1LEE8yqeRevq7ttmJmlY7z0iYCCCCAQLoC9vxtmK4LZ0MAgQwFDp4aULLmB5t%2BAcr26TfmDAggYJ6ArCn1bk9evbB%2BqXmdo0cIIFC3QBickqCUBKfkK9xeXLUo%2FJHvmgRyDXNVPijfxYaACHAtVL4ObCjfJ8Go358dVP%2F596FIZfkqC9T3rpQKlK%2Fwvi4BKrnnS4DKpgBffaNmbwQQQMB9AYJS7s8xI0TAOoF3e85b12dbOyxZUmwIIICAjwJvHPo7QSkfJ54xOy0gDyvlS8r1yZpTsuUa%2BS%2Bv7klf3fw9AhG6kWnfGQGTy%2FeZFIwqN%2BHy4YMwK1aypx5bNJ9s2HJYvI4AAggYLMC%2F0A2eHLqGgK8ClO5LZ%2BZfeXyFohRYOtacBQEEzBOQjNw3D50lMGXe1NAjBGILyEPfHWsWx26HBmoTaLr1ltp2ZC%2FnBSSjha2yQPPcWyvvkNG7smbUv%2F31YjErKaMu1H3asMyffAhBPpCw6e47WIOqbkUOQAABBLIRICiVjTtnRQCBMgKU7isDk%2FDLEozqXndXwq3SHAII6BZoCR60siUnsO3AafXMuhxrSyVHSksIIOChQJOhD9ltnYqmufYG%2BQhKVb%2Fq2oNylyZtkh318vF%2FFNeNMqlf9fRlaom%2F1U3z1KaOFrKn6gFkXwQQQCADAXv%2FtZMBFqdEAAH9ApTu028sZ5CyfWRJpWPNWRBIUqCFMlRJcipZW2rjO72JtkljCCCAgG8CNqyRY9OcNM%2Bx9zHN6LV%2F2kSdSV9NKikq2VFPHu63OiA1cxJPjFwOgmwX1L%2F86Uzxe2H86sxd%2BB0BBBBAwAABe%2F%2B1YwAeXUAAgeQFKN2XvOnMFiezpNpnvszvCCBgiQDZUslOlPy9I2X82BBAAAEEEEAgnsDwxLV4DTh%2BtEkB3D39g2rzp3mryvXVc3lI9tS%2BwrD68cdfEJyqB459EUAAgZQECEqlBM1pEECgukBvflTJGh9segUkS4oNAQTsFWhpNHMtAntFldq693O179hFm4dA3xFAAAEEHBCQ9dBs3ijfV3n2TJnfnX1fqddOflm5sw69S3DKoclkKAgg4IwAQSlnppKBIGC%2FwP5jF%2BwfhOEjIEvK8AmiewggkJnA5veOq978SGbn58QIIIAAAgiYlEkTZTZkfSK28gImzO9Ln11Qb58eKN9Jh98hOOXw5DI0BBCwToCglHVTRocRcFdg37FL7g7OkJGRJWXIRNANBGIIsB5cDLwKh8r6Uo%2B8dYTAVAUj3kIAAQQQ0CtgQtAizggL4xNxDnf%2B2KwzpSQgtf%2F8sPPO1QZIcKqaEO8jgAAC%2BgUISuk35gwIIFCDwJmBcR4E1uAUZxeypOLocSwC5ggsa2swpzOO9SQMTFHKz7GJZTgIIKBVgOyY5HhtD0oNT5ApVelqaG%2BYU%2Bltre%2B9dvJSagGp5rm3qPaGuTe%2B5HcTN4JTJs4KfUIAAV8Esvsb0RdhxokAAjUJHDzlZwmBmnAS2oksqYQgaQaBjAVaLF9vImO%2BqqeXwNTGd46qbcH6e688vqLq%2FuyAAAII%2BC5wYuSy7wSJjT%2FrTJq4AxmlfF9FwqyCjrKG1J7%2BoYp9i%2FqmBJ%2FWtTWq%2B1sb1eqmeao9%2BHdq85zSQSi5V0gQu2fgW%2FXJ4FjxK%2Bp5kzxOglMfXBxVmzpa1LMrFiTZNG0hgAACCJQRIChVBoaXEUAgXYH9lO7TCt7SOEc9vLJV6zloHAEE0hGgfF86ztsOnFaSxfv6xlVK7qFsCCCAAAKlBQhElHaJ8mqWmTRR%2BjvzmDzl%2B2aSTPs9i6CjBFySXkNKMp82dbQWA1ESjKp1k6CVbOExw0GA6sMgGCR9lCBVlpsEy8Rp%2F%2FkRtWV5m9rQ3pxldzg3Aggg4LwA%2F8N2fooZIAJ2CBw8NWhHRy3t5YZ7FykeZFs6eXQbgRkCdxAgmSGi79fdPQUlfz999Nza4B5K2UR90rSMAAK2CsiD3L%2BRKZXY9GURtEis80FDlO%2BrrNk899bKOyT8rqzx9ZvPk1u3Wa5PCdg8umh%2B2WyoeoYgGVUS%2FJGv%2FNhEMSgkAaosN%2BnHy8cvFINkkjVle6A4S0vOjQACCFQSKJ1TW%2BkI3kMAAQQSFujNj6qh4B9%2FbPoEKN2nz5aWEUhboCvHJzfTND8zMKbuefVjtf1AX5qn5VwIIICAFQJZZzdYgVRHJ3MZrjlURzdL7ioP89kqC0ipuzS37iP5RAKFkhn14qqF6o8PLSsGkMqV54szNgl47Viz%2BMY54rSVxLESHPvxx18oKX3IhgACCCCQvABBqeRNaREBBOoUOMR6UnWK1be7lO0jS6o%2BM%2FZGwGSBlsZ0P2VrskWafZNyfve8%2BqdiSb80z8u5EEAAAZMFZB0WtuQE2m%2F7XnKNpdzS6LXrKZ%2FRvtPlUsx2l2BKEoFCKbX3%2FgNLi%2BstpSEeBqckQGVC5qCU9PuXP51RhfGraQyfcyCAAALeCBCU8maqGSgC5grsO3bR3M450LNn1rU7MAqGgAACoYAEmVuCT5OypS8QZk1tfu84wan0%2BTkjAggYKECmVHKT0hSUMtORgZJcDyu39PWVa5V38Pxdmd%2B0Ninbl8Q6UpIdtXvtkiA4lP7KH1LSb9d9OSMCUxLcI2sqrauX8yCAgC8C6f2t6Iso40QAgboFpHwfmx4BeXjdTVBKDy6tIpChAOsbZYgfnFrWmnrkrSPq3eA7GwIIIOCrQM%2FAt4lkYvjqN3Pcq5vmzXzJqt%2FJJKk8XWlm%2Fbz02YXKnanyrpTr%2B11ne2rZUeW6I2Z%2FeLBDPbbo9nK7pPo6WVOpcnMyBBBwXICglOMTzPAQMF3gYFC6j%2FWk9M2SlO5jQwAB9wS6cvPdG5RlI5Ksqe4gY0pK%2BhGcsmzy6C4CCCQisP%2F8SCLt0MikgO1BqZGrZEpVupbTypSStZDiZDBKQGrXfUuMCQSJmwTIJHPKhI2sKRNmgT4ggIALAgSlXJhFxoCAxQJHyZLSOnuU7tPKS%2BMIZCbQlTPjP%2BaZARh04qnBKcrRGjQxdAUBBLQKSHkwefjNlpyA7UGp4QnWlKp0NaSVKRW3bJ8EpEy8FmWNKVMCUzLP4vzy8QusNVXpouc9BBBAoIIAQakKOLyFAAL6BXiAp89YSveRKaXPl5YRyFJA%2FnyzmSUgwamN7xwtlvWTLGA2BBBAwGWBnX3c55Ke39Xzv5d0k6m2VwjW3WErL9DeoH9dJgkUSyZP1E3WkDIxIBWOx7T%2BiXf3kXPqxMjlsIt8RwABBBCoUYCgVI1Q7IYAAnoEWE9Kj6u0uuHehfoap2UEEMhUoJPyfZn6Vzr5wVODQWDqU9acqoTEewggYLUAWVJ6pm91c4OehlNqNT9%2BNaUz2XmaNMr3xclefHbFgszXkKo2s5Ol%2FO5SUmLQlE2CgE8e7lc7%2B74ypUv0AwEEELBCwJw7uRVcdBIBBJIUkIAU60klKTq9rWfW3TX9BX5DAAFnBCRTqiVY%2FJnNXAEJTrHmlLnzQ88QQCC6AFlS0e3KHXl%2FKxnQ5WxceV13%2BT4JFkddS0r6tmV5mxXU0tcda%2B40rq9hOb%2Fhq5SxNG5y6BACCBgpQFDKyGmhUwj4IdCbpw69rpmWB9asOaNLl3YRMEOA8pxmzEO1Xkxdc%2BrdnkLwYQw%2BSV7NjPcRQMBcAcnEiJONYe7Isu2ZySXTapUp8PdbRarmubdWfD%2Fum3GCxbKOlE3bowtvVyYGcuXe%2BL%2BCrKkCWYM2XU70FQEEMhIgKJURPKdFAAGlDgWfImfTI8DDaj2utIqASQL8OTdpNqr3JQxO%2Fei3h9Xm946rMwPj1Q9iDwQQQMAgAcnEkGwAtuQFTHzAXu8o88H1wVZeoL1Bb4Z71CypDe3NKteof72r8jLR3tmxZrFRZfzCUUg5P9aZCjX4jgACCJQXIChV3oZ3EEBAs0BvfkTzGfxt%2Fpl17f4OnpEj4IlAZ67Jk5G6NUwJTu0OMqbuefXjYnDq4Cke8Lo1w4wGAXcFJBNDHriyJS%2Bwusnu9aRGKFlW9aLQGfjpGfg28p%2FNLcsXVO27iTtIGb%2Bf3N1iYteKcyHrTP3%2BLB%2FCNXKC6BQCCBghQFDKiGmgEwj4KUBQSs%2B8twSfdCODQo8trSJgkkBXEJRiXSmTZqT%2Bvkhw6pG3Pg0CVH9SUtqPDQEEEDBVYE%2F%2FIGX7NE2OlO7TGbDQ1O1pzUoWHVt5gaY5eh%2B9fXjpm%2FInr%2FCOrVlS4ZCeXtoa%2Fmjk9998%2FqXa2feVkX2jUwgggEDWAnr%2FZsx6dJwfAQSMFeCT4fqmhoCUPltaRsAkAQlAd%2BXmm9Ql%2BhJRICztJ8EpSvtFROQwBBDQJkDZPm20xYZdKN339ZVrepEsb12yenRuRwbHIjW%2F6e47Ih1nykES7DP9z4%2BUPCUwZcoVQz8QQMAkAYJSJs0GfUHAI4Gj%2BVGPRpvuUJ%2B4d1G6J%2BRsCCCQmcAG%2FrxnZq%2FjxFNL%2Bz3y1hGyp3Qg0yYCCNQlIAGp7iN5NTxxva7j2Ll2gccW2f8Bk9Fr%2F6x9wB7uqTNTSkon%2Fm3kct2qkqG3utnuspEy6GdXmF9%2BUAJTLx%2B%2FUPcccQACCCDgsgBBKZdnl7EhYLCAPHhj0yNAppQeV1pFwESB9SvbTOwWfUpA4OCpQdX93vFiaT%2BypxIApQkEEIgk8LPe85HXqol0Qg8PMj3To5YpyY9dqWU3b%2FfRmSn1t%2BHxSK5P3OXG2qTy56d5rvmPNvcVhpWsMzXM%2BmuRrlcOQgAB9wTMv3O7Z86IEEAgEGA9KT2XwbK2RiVfbAgg4IeAlO9b1mb%2Fp1z9mK1ooyR7KpobRyGAQHyBlz67oE5EyMCIf2Z%2FWnAhICWzRSZd5Wu2vWFO5R1ivHtytP4sKTnduiCY48pmy58juZ9uPnKOwJQrFx7jQACBWAIEpWLxcTACCEQV6KV8X1S6iseRJVWRhzcRcFKAEn5OTmvJQc3MnurND5fcjxcRQACBuAKyBsr%2B89xj4jpWO35De3O1Xax4X0rIsZUX0JkpdWK4%2FqCUlBN0oXRfKG5LUEr6S2AqnDW%2BI4CA7wIEpXy%2FAhg%2FAhkISEBqaGwigzO7f8r1K1vdHyQjRACBaQKsIzeNw4tfwuypH%2F32%2F6of%2FfZwce2pMwPRyvd4AcYgEUCgLgEJSMkaKGz6Be5vvU3%2FSVI4g6w9xlZeQGdQKj9%2BtfyJy7wj60m5tK1rs%2BvPEYEpl64%2BxoIAAlEFCEpFleM4BBCILHCW9aQi21U7UEp5sSGAgF8CkiHZ0jjXr0Ez2hsCUg53cu2pj9XGd3rVvmMXb7zHDwgggEC9AgSk6hWLvr9kd%2BQa9ZV1i96z%2Bo%2BkfF%2F9ZkkdURgjKNXeYN%2B%2FgwlMJfUngHYQQMBWAYJSts4c%2FUbAYgHKDemZvJbgP7VdOTdKgOgRolUE3BXYuv5udwfHyGoW2HfsUhCYOqruefVPavN7x4P1Gym9VTMeOyKAgCIgle5F4ErpPlGLEhhJVzvbs%2BkMmoxcu1b34HSucVV3ZxI4QMoRNs%2B17%2FEmgakEJp8mEEDAWgH77trWUtNxBBAIBVhPKpRI9ntXrinZBmkNAQSsEaCEnzVTlUpHKe%2BXCjMnQcApAQJS6U%2BnK6X7RC5KYCR98ezOqDMjLkqWWvPcW7PD0HTmplvtHJMEpp7vLWhSoVkEEEDAXAGCUubODT1DwFkB1pPSM7VSwosNAQT8FJCgNPcAP%2Be%2B2qinlveT7KmDp1gnppoZ7yPgm8BLn11gDamUJ%2F3Rhbc7U7pP6KIERlImz%2Bx0OteTijooySxybWu3uBTmJ4Nj6uXjF1ybEsaDAAIIVBRw72%2BiisPlTQQQMEGATCk9s7B%2BZZuehmkVAQSsEHhmXbsV%2FaST2Qns7imoR976tFje793g5zMD49l1hjMjgEDmAiNXr6vuI%2BfU%2FvOU%2Bkx7Mlwq3Zcfm0ibz6rzmVgqz8VMKasuihKd3VcYLpZQLfEWLyGAAAJOChCUcnJaGRQC5goMBQuxkimlZ34o36fHlVYRsEVgw72LVEujfQs92%2BLrUj%2BlvF93kDV1z6sfF9eeInvKpdllLAjUJlAYnygGpOQT%2BmzpCkjmzGOL5qd7Uo1nIyilEVdT08yZJtiYzb59eoDAVExDDkcAAXsECErZM1f0FAEnBFh0Xc80tgTlCuSLDQEE%2FBWQe8DW9Xf7C8DIIwmQPRWJjYMQsFpA1jDpPpJX8p0tfYH7WxvTPylnzEzAxPJ9mWFoPHEh%2BPCrC5sEpiRrig0BBBBwXYCglOszzPgQMEzg67FrhvXIje6QJeXGPDIKBOIKvLB%2BKdlScRE9PZ7sKU8nnmF7JyAPOzd%2Fek6RKZHd1G9ZviC7k2s4c2HcjWCABppik7rL9%2BUa6s%2BSd%2FHPfz7I%2FnRle%2B3kJT404MpkMg4EECgrQFCqLA1vIICADgEypXSoKkVQSo8rrSJgmwDZUrbNmJn9DbOnfvTbw0rWnmJDAAE3BHb2faVePn5BDU9cd2NAFo5C1pLKOVbdwMUAR5KXlomZUq4FEmV9PJc2Gc%2FzR88r1%2BbJpTliLAggEF%2BAoFR8Q1pAAIE6BOST2GzJCxCUSt6UFhGwVYBsKVtnzrx%2B9%2BZHvlt76k%2FFtafODIyb10l6hAACVQUmH3AWlJSFYstWQIJSrm2uBQSSnh%2FdQanVzd%2Bru8uule7827B7%2Fz6RYO%2FPegtq2LGAW90XKwcggICzAgSlnJ1aBoaAmQI80NIzL0vbqE2vR5ZWEbBPgGwp%2B%2BbM9B7LB0oke%2BqeVz8uBqcOnuLBtulzRv8QCAXk4fOTh%2FvVBxe%2FCV%2Fie0YCEpxwcT2pkQnKs2d0SRVP2x6hfJ%2FcF1wKdnwy6OYHX2We3g4yXNkQQAABFwUISrk4q4wJAYMFyJTSMzlkSulxpVUEbBUgW8rWmTO%2F32Fpv0feOkJpP%2FOnix56LrCnf5D1owy6BrYsbzOoN8l1Jc%2BaUhUxowSNKjY4482o5SBPBgEPVzZXg1IyP3v6h9Tvzw66MlWMAwEEELghQFDqBgU%2FIIBAGgJkSiWvLFkR8sWGAAIIhAJkS4USfNclcPDU4I3Sfqw7pUuZdhGIJiDl1F47eSn4%2BpL1o6IRJn6UZEm5WLpPoEYpL1bxeokaNKrY6JQ317XdNuW32n%2F84OJo7TsbvGdhfEK5HJQSeim96lrJRYMvKbqGAAIpCfAUMyVoToMAAkoNjV2FQYMAWVJKkYGn4cLyqMmW4EGRi4FdyZba3XOePx8eXctZDFXuv93vHVfbDpxW3evuUs%2Bsy6llbQ1ZdIVzIoBAICAPaLuP5JWsR8JmjoCrWVIiPDxx3Rxow3qiez0pGa5kYjXPvaXuedhXGFYvrlpomFj93enxYM3qyXUBz6v3H%2BxQzXPILaj%2FKuEIBBAwUYCglImzQp8QcFSgNz%2Fs6MiyHZaLD9PrFZUyUmTh1avG%2FqFA97p2teupNeGvznyXe4OMS%2F58sCGgW0CCUxKYmgxOtatXHl9BcEo3Ou0jMENAyvXJJ%2BoJEsyAyfhXl7OkhDYfBELZSgu0N%2Bh%2F5NYUBClWzZ9Xd7aQBDokw8j2dc7knufDJh80%2BE2QAbtjzWIfhssYEUDAAwFC7B5MMkNEAAG3BciUUqor1%2Bz2JDM6BCIKPLyyVckXGwJpCsi6U%2Fe8%2BrHaHGRQ8YGBNOU5l68C8nD5pc8uUK7P0AvA5SwpufbYsheIGlja2fdV9p2P0YOegW%2B9ygqV7DbWl4pxwXAoAggYJUBQyqjpoDMIuC3Agyk987usrVFPwxa1SqkoiyaLrqYuINlSUqKQDYG0BQhOpS3O%2BXwUkIeyTx7uV%2FvPU5HAxPl3PUtKykWylRdY3TSv%2FJsJvhN1XSnJlLJ5PSZfsqSmXioy5sI4yyJMNeFnBBCwU4CglJ3zRq8RsFLgrAf1nrOYmKUEpVRnrikLes6JgBUCErh%2B5fHlVvSVTropQHDKzXllVNkLSLm%2BzZ%2ByflT2M1G%2BBy5nScmov75yrfzgeUdJab00NsmUygVrS0XZbM2WkqwhmwNqUeZKjpnMjP1H1MM5DgEEEDBGIJ2%2FIY0ZLh1BAIEsBYbG%2BESPDv%2BWxlt1NGtVm2SLWTVddDYDga3rOyjjl4E7p5wuQHBquge%2FIRBVQLJTuo%2BcK5bri9oGx%2BkXkEDBhna3S0yPXvunfkiLzyCZcmltT7RH%2B5CeBHZsKwkngRkfs6TCa8nGOQv7zncEEEAgFCAoFUrwHQEEtAtQvk8P8bK22%2FQ0bFGrrKtl0WTR1cwEKOOXGT0nniFAcGoGCL8iUIeAZEdJuT4fMwTqYDJi1x1r7jSiHzo7kR%2B7orN569tOMyj19NLoa4jaVhJOsrvyY36XjrRtzqz%2Fw8wAEEAgcQGCUomT0iACCJQTGPL8H47lXOK%2B3tI4J24T1h8vBqyZY%2F00MgDNApJRuPennZrPQvMI1C4gwalH3jqith%2FoU2RT1%2B7Gnn4KSGbA80cLxeyo4YnrfiJYNGrJkMp58G90rsXKF2XTrf%2Bt8g4JviulAiU7L8om95ef9RbUcPDd9E3K9u3pHzK9m9r7Rxk%2F7cScAAEENAsQlNIMTPMIIHBTgAdONy2S%2BomydTcll7U13PyFnxBAoKTAwytbg%2FWlVpR8jxcRyELgTLDe5LYDp9WPfntYvRsEqdgQQGC2QM%2FAt8XsqA8ufjP7TV4xTkCyY7YsX2Bcv3R0qMCHDiuytt%2F2vYrvJ%2F3msyuiX3cnRi6r35y8lHSXEm1PSpf%2B5nOz%2B5jogKs0Rhm%2FKkC8jQACRgsQlDJ6eugcAm4JkCmV%2FHwSiLlp2pWbf%2FMXfkIAgbIC2x5fzvpSZXV4IysBCU51v3dc3fPqnwhOZTUJnNc4Afkk%2FGvBQ%2BLNn%2Ba9L1Vl3ORU6NCW5W1eZEkJQX6cNYMrXAqqOcheSnOTTKmo2VLST8lCktJ4Jm6Ta%2BnlFdl502dHyvjZkOE2vdf8hgACCCiV7t%2BQiCOAgNcCrCnl9fRrH3xXzu2FpLUDcgKvBPb%2BtEuRaenVlFsz2DA4tTkIUPHvBmumjY5qEAizoyhTpQFXY5OSJSWl%2B9gQSHM9qanacbKlpB0JcpgWmAoDUr6vIzV1nsOf5cMLpme4hX3lOwIIIDBVgKDUVA1%2BRgABBCwT4KHyzQnD4qYFPyFQTUDWYfvouftYi60aFO9nJiDrTd3z6sesN5XZDHDirATIjspKPpnz7rpvSTINWdJKYYxMqXJT1d6Qzbq%2Fkin19NLWct2q6XUJTEmWpgmblBXsPkK2aKW5kAw3KeXHhgACCNgkQFDKptmirwhYLMB6Unomj%2FJ9N107Kd93E4OfEKhBQAK5BKZqgGKXTAVYbypTfk6essDkw9dziuyolOETOp1kqOSCD334tOWDNX7YSgs0pVy6b2ovpIRk89x4j%2FvkPvTk4X5VyLBE457%2BwaB86TnKl06d3DI%2FmxJELNM9XkYAAQRmCcT7W2pWc7yAAAIIlBZgPanSLryanIA8YG8JSqawIYBA7QJduSb1%2BsYf1H4AeyKQgQAl%2FTJA55SpC0i5LHkALIEpNvsEpFSbBALYEAgFsirfJ%2BeXgNiONXeGXYn8PQyUSyZOmttkub5zQbbWl6whVSO8zNXvzw7WuDe7IYAAAtkL%2BPUxnuy96QEC3goMjV3zduw6B07Juum6kjnWm%2BcTm9NV%2BA2BygLd69qLO8gaPmwImCwgJf32Hbuotq7vUK88vsLkrtI3BGoWkIevL312gdJLNYuZuaNvZftkFqTUJOtnlb8e72%2B9rfybKbzz6MLbi%2FMTN6Ak6zi9fPxCMYPzP7ralc6yhHJNSWDlP%2F8%2BRDAqwjUiZRc35O5QzRlm6UXoNocggICnAgSlPJ14ho1A2gJDY1fSPiXn81CgKyjh15sf8XDkDBmBeAISmDozMF5cvydeSxyNgF4BKQcsJf1295wPyk%2BuVZSx1etN63oFpDSVPEQcnriu90S0rlXAx7J9AjqZjbNYqy2NxxN4cdXCYsBbAktxN8nE%2BfHHXygJdm3qaFHr2pILuhGMijs7k8eL454gqCf3JDYEEEDAdAGCUqbPEP1DAAEEKgjc4Vnd%2BgoUxbfIHKsmxPsIlBfY9vjy4pvbD%2FSV34l3EDBEQEr63fPqx0quW7KmDJkUulGzANlRNVMZv%2BP9rY2U7TN%2BlvztoAQOd92XU%2F%2Fr%2F%2FYnFvz%2B8NI3Sr6kPKEEqOQrSoBKAij%2F58Ko2n9%2BWJ0cvZxY%2F%2Fyd7cmRy1pgm5a2ki3l%2B4XA%2BBGwQICglAWTRBcRcEHga8r3aZlG1lCazro0WFeKDQEEogsQmIpux5HZCJA1lY07Z40uQHZUdDvTjpSH8kms22PauOiPWwJynf6us111HzmX6MAk%2B0oCIPLVPPcWtWr%2BPLW6aV4QrJpT%2FHnmyfJBpvPotWvBunlXVE%2FwwRIJzrMlLyDBvreDNQolS44NAQQQMFmAoJTJs0PfEHBIYDCBkgEOcTAUTQIPr2zV1DLNIuCPgASmpCQaa0z5M%2Be2j1Sypn702z8Xs6ZeWL%2FU9uHQf0cFyI5yb2K3LG8rPoB3b2SMyDUByejbsWZxcW0oHWOTEqSfDI6xNp4O3AhtSqDw6SBbSuf6XxG6xSEIIIDANIFbpv3GLwgggAACCFgsQPk%2BiyePrhslIGtM7f1plyIb06hpoTMVBGStqa17Py8GU2V9NDYETBLYVxhWTx7u54GtSZMSsy%2ByZsuG9uaYrXA4AukJyPUqgSk2PwR2BtlSbAgggIDJAgSlTJ4d%2BoYAAghUEWCB99lAmMw24RUEoghsuHeh%2BssvHgiypiiLGcWPY7IR2N1TUI%2B8dUQRmMrGn7NOF5AySs8fLRSzEySTgM0NASlRJllSbAjYJkBgyrYZi95f%2BTBEYfxq9AY4EgEEENAsQFBKMzDNI4AAAgikK9CV41Or6YpzNpcFJCD10XP3EZhyeZIdHJuU87vn1Y%2FVm4fOOjg6hmSLQM%2FAt8XsqA8ufmNLl%2BlnDQLh%2Bjw17MouCBgpIIGpPzzYEZSenGtk%2F%2BhUcgJkSyVnSUsIIJC8AEGp5E1pEQEESgicDR4QsSGQhgCZUmkocw6fBCQw9ZdfPKg23LvIp2EzVgcEpJzfz%2FeedGAkDMEmAcmOeu3kJbX507zKs6aqTVNXU19%2F13kX60jVJMVOJgtItt%2Bu%2B3IEpkyepAT6JtlSw8HfSWwIIICAiQIEpUycFfqEAAIIIBBZoDPXFPlYDkQAgdICLY1zgjWmOtUrj68ovQOvImCowBuH%2BoOsqT9Rzs%2FQ%2BXGtW2F2lCwyz%2BaewIurFip5mM%2BGgAsCkin1x4eWqaeXtrowHMZQRmDP2cEy7%2FAyAgggkK0AQals%2FTk7AggggEDCApTvSxiU5hCYIrDt8eVBcKqLcn5TTPjRfAEp58c6U%2BbPk%2B09JDvK9hms3P9nVyxQmzpaKu%2FEuwhYKPDLH3xf7VizmKwpC%2Beuli7LhyTIlqpFin0QQCBtAYJSaYtzPgQQQAABrQKU79PKS%2BMIBGX8FrLOFNeBdQISmPrRb%2F%2Bs3u0pWNd3Omy2QGF8orh2FNlRZs9TnN49tuh2tWV5W5wmOBYBowXCdabImjJ6miJ1TkrKki0ViY6DEEBAswBBKc3ANI8AAgggkK6AlBkjMJWuOWfzT0DWmfriVw9Rzs%2B%2Fqbd6xENjV1X3e8fV9gN9Vo%2BDzpsjsKd%2FsBiQOjFy2ZxO0ZNEBaTE2b%2BvuTPRNmkMARMFmubcoiRrSkr6SZCKzR0BPjThzlwyEgRcEiAo5dJsMhYEEEAAgaIAJfy4EBBIR4Byfuk4c5ZkBbYdOE1gKllS71qT7KjuI%2BfUaye%2FVMMTLCLv6gUgAald9y1RzcHDejYEfBGQ617K%2BYXBqea5XP%2B2z71kS30yOGb7MOg%2FAgg4JsDfLo5NKMNBAAEEEFBkSnERIJCiQFjOr3tde4pn5VQIxBMgMBXPz%2Bejewa%2BLWZH8YDP7atAHsRLQCoXZOCzIeCjQBicev%2BBDtaccuAC2Nn3lQOjYAgIIOCSAP%2FCcmk2GQsCCCCAQFFASouxIYBAegLyZ27XU2vU%2BpWtQQbKaSXr97AhYLqABKbODIwXr13T%2B0r%2FsheQT5rLQz3KIGU%2FF7p7QEBKtzDt2yQgwSn5kpJ%2BUqpU7oESlM%2BPTdg0DO%2F7KnM2HPw9Ruan95cCAAgYI0CmlDFTQUcQQAABBJIS6Mw1JdUU7SCAQB0Cki310XP3KbKm6kBj10wFdvcU1OZgnSk2BCoJyIPYJw%2F3E5CqhOTQey%2BuWqhWN81zaEQMBYFkBOTPRVjaT77f38oHAZORTaeVPWcH0zkRZ0EAAQRqECAoVQMSuyCAQHyBluDTVWwIpCXQRVAqLWrOg8AsgTBrSjKnyFqcxcMLBgoQmDJwUgzq0p7%2BQbX503NkBRg0Jzq78usfLlZP3NWs8xS0jYATApI5tXvtkuLaUxKgIpBr%2FrSS6Wv%2BHNFDBHwSICjl02wzVgQyFLiDeuwZ6vt36pbgeiMQ6t%2B8M2KzBMiaMms%2B6E1lAQlMbT%2FQV3kn3vVKQMr1PX%2B0oF47%2BaUanrju1dh9HeyzKxYQkPJ18hl3ZIGwtN8fHuwoBqgkWCWvsZknIH%2BvsR6iefNCjxDwVYCglK8zz7gRQMAJgSFqeZedx2VtDWXf4w0EEEhHIMya%2BuJXD5E1lQ45Z4khIGtMEZiKAejQoT0D3xbL9X1w8RuHRsVQKglIQGrL8rZKu%2FAeAghUEZBgVFjeT7KoJEDFZpbA7ynhZ9aE0BsEPBYgKOXx5DN0BBCwX2Bo7Jr9g9A0gq7cfE0t0ywCCNQrIMEpCUxR0q9eOfZPW0ACU28eOpv2aTmfQQKT5frylOszaE50d4WAlG5h2vdRQNabCgNU8p3sKTOuAsmUGg4yptgQQACBrAUISmU9A5wfAQQQQECLQFeOT%2BZpgaVRBGIIhCX9tq5fGqMVDkVAr8DWvZ%2Brg6dYDFyvsnmtS1mj7iPniuX6zOsdPdIlQEBKlyztIjApEJb3%2B%2BNDy4pBKoJT2V4Z8nfdhxdHs%2B0EZ0cAAQQCAYJSXAYIIJCKQCt1pbU4nx0Y09KuC41KZgYbAgiYJyB%2FNl%2Ff%2BINi5pQEqdgQMFFg4zu96szAuIldo08aBMJyfay1oQHX4CYJSBk8OXTNSQEp50dwKvup3VcYzr4T9AABBLwXICjl%2FSUAAALpCNzReGs6J%2BIsCHwn0En5Pq4FBIwWCNeb%2Bui5taw3ZfRM%2Bdm5obGr6pG3jij5zua2AOX63J7fcqMjIFVOhtcR0C8gwald9%2BVYc0o%2FdckznBi5TAm%2FkjK8iAACaQoQlEpTm3MhgAACCQsMjU0k3KI7zckD7xYy9NyZUEbirMDDK1tZb8rZ2bV7YGeCbGTJmGJzU0BKGD1%2FtEC5Pjent%2BKofv3DxWrL8raK%2B%2FAmAgjoFZAyfrLWFOtN6XUu1Tol%2FEqp8BoCCKQtQFAqbXHOh4CnAi2N3%2FN05HqHzSe4K%2Fsua2uovAPvIoCAMQJSyu%2BLXz2kdj21hswpY2aFjsjaUm8eOguEYwKF8Qn15OF%2B9cHFbxwbGcOpJiABqSfuYt3Rak68j0BaAmHW1GOLbk%2FrlJwnEKBcLZcBAghkLUBQKusZ4PwIeCLQQvk%2BLTNNUKoyaxcl%2FCoD8S4CBgoQnDJwUjzv0ta9nysJTrG5ISBraUhAKk%2B2uRsTWuMomufeov7wYAcBqRq92A2BNAUka%2Bp3ne1KymqypSPwwcXRdE7EWRBAAIEyAgSlysDwMgIIIGCDAEGpyrMkJfzYEEDATgGCU3bOm6u93vzecdaXcmByXzt5Sb18%2FIIanrjuwGgYQq0C8sB7131L1OqmebUewn4IIJCBgJTV%2FI%2BudiVBZDa9AlLCj2wpvca0jgAClQW401f24V0EEEhIgOBAQpAzmpH1LtjKCywlKFUeh3cQsESA4JQlE%2BV4N%2BXv2%2B0H%2BhwfpbvDk4dv3UfOqT39Q%2B4OkpGVFCAgVZKFFxEwVuDRhber9x%2FoUPJnl02vANlSen1pHQEEKgsQlKrsw7sIIICA0QJkSlWenodXtlbegXcRQMAaAYJT1kyVsx1941A%2FZfwsnN1w%2FSg%2BEW7h5MXssmRGSYZUrnFOzJY4HAEE0hSYDCbnCExpRufvRc3ANI8AAhUFCEpV5OFNBBBIUmBZW0OSzdFWIEBQqvJl0MIn7CoD8S4CFgoQnLJw0hzqMmX87JpM1o%2Bya76S7O2G9ma1ay0BqSRNaQuBNAUITOnXPjFyWQ0HmcRsCCCAQBYCBKWyUOecCCCAQEIClO%2BrDNkSfDKWYGhlI95FwFaBMDj10XNrFVmRts6iff2mjJ89c7az7yvWj7JnuhLt6bMrFqgdaxar5jk87kgUlsYQSFmAwJR%2B8A8vjuo%2FCWdAAAEESgjwr7QSKLyEAAJ6BFhXSo8rganKrl255so78C4CCFgtIAEpCUx98auHlASq2BDQLUAZP93C8dqX9aNe%2BuyCevv0QLyGONpKgRdXLVRblrdZ2Xc6jQACswUITM02SfIVyZZiQwABBLIQICiVhTrnRMBTAUqp6Zn4obEJPQ070iqZUo5MJMNAoIqAfPBh11NrbgSn%2BCBEFTDejiWw%2FUBfrOM5WI%2BArB%2FVfeSc2n9%2BWM8JaNVYgea5t6jdQbm%2BTR0txvaRjiGAQDSBMDAlf87ZkhX48NI3yTZIawgggECNAtzRa4RiNwQQiC%2FQ0nhr%2FEZoYZbA0Twp97NQprzQmWua8hs%2FIoCA6wJTg1MSpCI45fqMZzO%2Bg6cGlXyxmSMwGZDKKz71bc6cpNUTeWD9%2FgNL1f2tjWmdkvMggEDKAvLn%2FHedZMQnzZ4PPuDKulJJq9IeAgjUIkBQqhYl9kEAgUQEyJRKhHFWI2RKzSKZ9gLl%2B6Zx8AsCXglMXXdqw72LvBo7g9UvsPm94%2FpPwhlqEpBA1JOH%2B5U8XGPzS%2BCxRber9x%2FsULlgHVE2BBBwW0ACz1Kiky1ZgU8Gvk22QVpDAAEEahAgKFUDErsggEAyAnxaPRnHma2cGRif%2BRK%2FTxGgfN8UDH5EwFMBWXdq7087Ke3n6fzrGras6fhuT0FX87Rbo8C%2BwrDa%2FOk5NTxxvcYj2M0VgWdXLChmTjTP4bGGK3PKOBCoJiAlOiUYzZacwCeDY8k1RksIIIBAjQL8661GKHZDAIH4AnfwCcb4iCVakIdibOUFWoLrjsBUeR%2FeQcAngZml%2Fboo7%2BnT9GsZ67YDp7W0S6O1Cezs%2B0q9fPwCAanauJzZS9aVkTJeW5a3OTMmBoIAArUL7FhzZ5AdObf2A9izogBZxhV5eBMBBDQJEJTSBEuzCCAwW4DAwGyTJF7pZU2pqoyU8KtKxA4IeCcgpf3%2B8osH1UfPrVXyMxsCUQTIloqilswxEpB6%2B%2FRAMo3RijUCq5vmFdePIlPCmimjowgkLtAUZEfuWLM48XZ9bZBMKV9nnnEjkK0AQals%2FTk7Al4JUL5Pz3STKVXdlYBodSP2QMBXASntt%2BupNcXSfvKdv6t8vRKij%2FuNQ%2F3RD%2BbISAKvnbxEQCqSnN0HbeoI7tdrl7B%2BlN3TSO8RSERA1pd6emlrIm353sjI1evBmoxXfWdg%2FAggkLIAQamUwTkdAj4LtJBir236CUxVpuUhc2Uf3kUAAVUMRknG1Be%2FeojsKS6IugR68yPq4KnBuo5h5%2BgCL312Qe3pH4reAEdaJyDl%2Bl5ctTD4%2Br5i%2FSjrpo8OI6BNQEp4yv2BLb7AiRHWqY6vSAsIIFCPAHfverTYFwEEYgnI2j4EpmIRlj1YHoixlRcgKFXehncQQGC2ANlTs014pbLA9gN9lXfg3dgC8knuJw%2F3q%2F3nh2O3RQP2CMi6MbvuW6I2dbTY02l6igACqQhIGb9f%2FmBhKudy%2FSSsK%2BX6DDM%2BBMwTIChl3pzQIwScFmhpvNXp8WU1uLMDY1md2orzdubmW9FPOokAAmYJSEB7ZvYUH64wa45M6Y1kSvEBEX2zIQGp7iPn1ImRy%2FpOQsvGCWxob1bvP9ihZB0pNgQQQKCUgNwnpJQfWzyBk6NX4jXA0QgggECdAgSl6gRjdwQQiCfQlWuO1wBHlxTozY%2BWfJ0XJwXkwTIPkrkaEEAgjsDM7Cn5nQ2BqQL7j12c%2Bis%2FJyRAQCohSIuaCcv17VizmHJ9Fs0bXUUgK4FnVyzI6tTOnJcPfTgzlQwEAWsECEpZM1V0FAE3BMiU0jOPfDq7uuuytobqO7EHAgggUEVAStFK9tRHz60trj8lP1MitAqaJ2%2B%2Fcajfk5GmN8zC%2BESxZB8Py9Izz%2FpMUq7v%2FQeWUq4v64ng%2FAhYJCCZUmRLxZswyvfF8%2BNoBBCoX4CgVP1mHIEAAjEEyJSKgVfhUIJSFXC%2Be6uLEn7VkdgDAQTqEpBg1K6n1hSDU3t%2F2qU23LuoruPZ2S2BobGrSsr4sSUjIAGp7iN5xYOyZDxtaGVTR2uxXF8uCP6zIYAAAvUIkC1Vj9bsfSUrOR%2F8O4YNAQQQSEuAoFRa0pwHAQSKAnfwn0xtV0JvnoW%2FK%2BESEK2kw3sIIBBXYMO9C9Xen3YWA1QSqCJ7Kq6once%2F21Ows%2BOG9ZqAlGETork7Uq5v99ol6sVV36dcn2ZrmkfAVQGypeLP7MgEQan4irSAAAK1ChCUqlWK%2FRBAIBEBAgOJMJZs5CjrSpV0CV%2FkAXEowXcEENApIPcaKen3xa8eKpb4k5%2FZ%2FBHYF6wrJRlTbNEFJteQIkMquqBdR8qDZCnXR%2Bktu%2BaN3iJgogDZUvFm5cTolXgNcDQCCCBQhwBBqTqw2BUBBOILsK5PfMNyLVDCr5zM5OudlO%2BrDMS7CCCQuMDDK1tvlPcjeypxXiMblIAUfx9Hn5rJgNQ5SvZFJ7TmSMmOenHVwmKGFOX6rJk2OoqA0QIS3JZ7C1s0geGJa9EO5CgEEEAgggB36whoHIIAAtEFZIH4lmABY7bkBVjHorKpZC9w7VU24l0EENAjMDV7irWn9Bib1Col%2FKLNRhiQOjFyOVoDHGWNwOqmecXsqE0dLdb0mY4igIAdAj%2B5m%2FtK1Jk6SaZUVDqOQwCBCAKsIBoBjUMQQCCegGRL9eYn4jXC0bME5JPZ8gltCfyxlRaQTIWhMX%2BuvZ%2Fv%2Fdyr8ZaedV5FwCwBWXtKvs4MjKntB04r%2BUCB%2FMzmjoCU8Nul1rgzoJRG8vLxfygCUilhZ3iaTR2txbWjMuwCp0YAAYcFNrQ3q7dPDzg8Qn1DI1NKny0tI4DAbAGeXM424RUEENAs0BWUUaO0jR5kcZVyUWylBeRBsE%2Fb9gN9BKV8mnDGapWAZE9JoFy23T2FYoCK4JRVU1i2s%2FIBEQk28vdxWaJZb7z02QX1wcVvZr3OC%2B4I5IJKCTvWLGbtKHemlJEgYKSA3GukjN8ng3zgp94JKoyzJma9ZuyPAALRBSjfF92OIxFAIKJAV6454pEcVk3g0Ck%2BFVbNiPcRQAAB0wS617WrL371kProubVKfmazX4C%2Fj2ufw519X6n954drP4A9rROQ7Kj3H%2BwgIGXdzNFhBOwUkKAUW%2F0CUkaXDQEEEEhLgKBUWtKcBwEEbgjIp8PZ9AiwrpQeV1pFAAEE0hCQzBrJnpIAlQSnWAcvDXU95%2BDv49pcJSBFmaXarGzcSzIWdq9dUizX1zyHRw82ziF9RsBGgf9n8Xwbu515nynfl%2FkU0AEEvBLgX4ZeTTeDRcAMgc6gfB%2BbHoFwXSk9rdMqAggggEAaAmFpv7%2F84gH1%2BsZVig9zpKGe7DkoU1zdc0%2F%2FIAGp6kzW7kF2lLVTR8cRsF5g1fx5qnkujzvrnUgypeoVY38EEIgjwF06jh7HIoBAJAF5uManvyPRVT1I1rHgQVhVJnZAAAEErBCQvy%2B3ru8oZk5JBhXBKSumrdjJ%2F5%2B9%2B4uxo7rzRV8DdsCB7rFNcEI3A8RGwBwuwhGByZFGMhmkyG%2BYc96iwwSUN8gk5CFKNLk6wOhwlVEeQlDI2xFkGM3TvYK8oXuVBJRIMwNEMWK4gVzMMWTamUBiO7ZJG2zIrd92NrTtXt37z6ra9edTUrO796pateqztnc39d1rreG6Uu1pcb0tfeno28U3Xv5NvSd1tloEjI6qhdlJCBBYR%2BCvPnLBOnsoXk1gqbyfYCNAgEAdAkKpOpSdgwCBswSu2Hr%2BWc95Io%2FA9194I09FaiFAgACBxggM150STjWmS9ZtyPNL1klaDenA8RPFF5%2F%2F1WpFnmu5gNFRLe9AzSfQIYFr5s%2Fr0NW4FAIECHRPQCjVvT51RQRaIbDTFH6V9ZORUpXRqpgAAQIzFxBOzbwLRm7A3qVjI%2B%2Fblx0jkLrjuaViaflEXy65F9dpdFQvutlFEmiVwE1bP9yq9jalsUdPGCnVlL7QDgJdFxBKdb2HXR%2BBhgrsXJxvaMva36xYXD2mDbIRIECAQHcFhFPN79v4fWw7XeBv%2F%2B3XAqnTSVr%2Fk9FRre9CF0CgkwLWlZqsW4%2B%2B%2B4fJDnQUAQIExhQQSo0JZncCBPIIXL84l6citawq8L1nllZ93pMECBAg0C0B4VRz%2B3P%2FwWUfElnRPQ%2Fv%2B23x7KHlFc%2F4ts0CRke1ufe0nUA%2FBBbP39iPC3WVBAgQaKGAUKqFnabJBLogsFMoVWk3PvHCm5XWr3ICBAgQaJZAhFM%2F%2BsINxb27dzSrYT1vzf6Dv%2B%2B5wKnLf%2Bz1Q8V3Xz3IoiMCRkd1pCNdBoGOC1x94Yc6foUujwABAu0VEEq1t%2B%2B0nECrBTZv2lBcsfX8Vl9Dkxsf60qZwq%2FJPaRtBAgQyC9wxdZNxX27txf%2F67%2F%2FZREhlW32As9bV6qIdaQEUrN%2FLeZogdFRORTVQYBAXQILm4yUGtf6yIl3xz3E%2FgQIEJhIQCg1EZuDCBDIIXDzlVtyVKOOVQQikPr%2BC2%2BsUuIpAgQIEOi6QIRTj3z22sFXfG%2BbnUB8SKTPWwRSdzy3VBw58V6fGTpx7UZHdaIbXQSBXglEkG4bT%2BDoSb%2BvxxOzNwECkwoIpSaVcxwBAlML7Fycn7oOFaQFHn3mQLpQCQECBAh0XiBGS%2F3sK58q7tl1eeevtakX2PdRyw%2FvO1gsLZ9oavdo1wgCRkeNgGQXAgQaKTC%2F8dxGtkujCBAgQKAohFJeBQQIzEzgeutKVWpvCr9KeVVOgACBVgjEdLnfuu2qcr2pT5bT5ho1VXen9Xmk1MP7fls8ceBI3eTOl1HA6KiMmKoiQKB2gcXybyDbeAJzG9wmHk%2FM3gQITCrg3WZSOccRIDC1wM4ylNpsSP3UjqkKTOGXkvE8AQIE%2BicQU%2Bb%2B6As3WGuq5q7ff3C55jM243TWkWpGP0zaCqOjJpVzHAECTRK48Fy3PMftD6PLxhWzPwECkwp4h55UznEECEwtEJ%2Fe3rl44dT1qCAtYAq%2FtI0SAgQI9E1guNbUvbt39O3SZ3a98QGRvk3hF%2BtRxDpStnYKGB3Vzn7TagIECBAgQIBAmwSEUm3qLW0l0EGBGC1lq07gqVcO9e5mWHWaaiZAgEA3BO7bvb14%2FPM7jVauqTsP92xNpZi2zzpSNb24Mp7G6KiMmKoiQIAAAQIECBBYU0AotSaPQgIEqha4%2BcqtVZ%2Bi9%2FV%2F%2B%2BnXem8AgAABAgROF9hz3cXFz77yF9aZOp2lkp%2F2HzxeSb1NrDTWkHrs9cNNbJo2rSFgdNQaOIpEjETPAABAAElEQVQIECBAgAABAgSyCwilspOqkACBcQR2lWtc2KoVePDp16s9gdoJECBAoJUCMZ1frDMVj7bqBF7rybpS1pGq7jVUVc1GR1Ulq14CBAi0U2Du3D9pZ8O1mgCB1gkIpVrXZRpMoFsCsa7UFVvP79ZFNexqYi2LmMbPRoAAAQIEzhQQTJ0pkv%2Fnvkzf9%2FC%2Bg6bty%2F%2FyqaxGo6Mqo1UxAQIEWiswt3FDa9uu4QQItEtAKNWu%2FtJaAp0U2HPdtk5eV5Mu6v4n9zWpOdpCgAABAg0SiGDq8c9fb42pivokPhzS9S2m7YsvW%2FMFjI5qfh9pIQECeQSOvftenop6VMvcRreJe9TdLpXATAW828yU38kJEAgB60pV%2FzqIkVJ9WtOielFnIECAQLcEdi7OFY989tpuXVRDrqbroZRp%2BxryQhuhGUZHjYBkFwIjCCwtnxhhL7vMWuB377w76ya07vzzG9wmbl2naTCBlgp4t2lpx2k2gS4JWFeqnt783jNL9ZzIWQgQIECglQJ7rru4uGfX5a1se5Mb3fVQyrR9TX71nWqb0VHN7yMtbK7A0ZPvFc8c%2FH3x2OuHir%2FZe6D4z0%2FtK%2B78qf%2Bvam6PfdCyY%2B%2F%2B4YMffLeuwJxAal0jOxAgkE%2FAZKH5LNVEgMCEArGu1M1XbrHu0YR%2Box724NOvF18qbzaGt40AAQIECKwmcO%2Fu7cUTL7xRjq5dXq3YcwROE%2FjBG8dM23eaSPN%2BuHHLpuKhnQuFT783r2%2B0qJkCMQrqmfJ34HOHl4uXjr49%2BDqzpUdOmBbuTJMm%2Fry0%2FE4Tm9XYNsUHGGwECBCoS8CdybqknYcAgTUFhFJr8mQpjE9qf%2Fvp14p7d%2B%2FIUp9KCBAgQKB7AvHBhZjG79Pfea57FzejK%2BpywPf3v%2FjNjFSddj2B%2BXJdkLu2X1Tcftnm9XZVTqC3AsNRUM8eOhVAvXzs7WLUwGmp%2FH%2BrRR%2F2a%2FRrJ%2FrINrqAkVKjW9mTAIHpBYRS0xuqgQCBDAK7rtxa1vJqhppUsZaA0VJr6SgjQIAAgRCID4r4sIjXwnoCD%2B%2F7bWFdlfWUZlN%2Bzdx5xUPXL7hhPht%2BZ22oQARQS79%2Fp3h2MALqncFoqFgTb9LtpaPHy39jF056uONqEIiRbrbRBYRSo1vZkwCB6QWEUtMbqoEAgQwCcfNrczlc%2FLBFYzNopqswWipto4QAAQIEPhCIUbVPGS31AYjvThOIG7nfffXgac%2F5oRkCt1%2B2pfja1R9pRmO0gsAMBYbT8MXopwgnxhkFNUqzhfKjKM12n2NlEGkbXcD0faNb2ZMAgekFhFLTG6qBAIFMAnuu%2B0jx6DO%2FylSbalICRkulZDxPgAABAkMBo6WGEh5XE3h4n0BqNZdZPhfT9cXoqFhDykagbwIxCurnR44PgqfhelCjTsM3qdXLx6xXNKldHccNXhNGSo1FvXC%2BW8RjgdmZAIGpBLzjTMXnYAIEcgrEFH5CqZyiq9dltNTqLp4lQIAAgdMF9ly3rXjqlUOnP%2BmnsQXi926Xtpiy6okDR7p0Sa2%2FlgiiHrj2Y6bra31PuoBRBYajoJ4bTMV3aiTUqMfm2i%2FWobI1VyBCStt4AkZKjedlbwIEphMQSk3n52gCBDIKxM2vO4sXM9aoqpSA0VIpGc8TIECAwFDgczctFPc8%2FvLwR48TCnQtlPri8%2F8xoYTDqhAwXV8VqupskkCMeHnm4O%2BLCIGqmIZv0muNYOxI2bb5DedMWoXjKhSI6Rpt4wksGik1Hpi9CRCYSkAoNRWfgwkQyCmwedMGC6vnBF2jrrhBdv%2BT%2B4pv3Xb1GnspIkCAAIE%2BC%2Fi93OfeX%2F3aY4SUdVRWt6n72Ziu73%2F8p48Vt2y7oO5TOx%2BBygQigFr6%2FTvFs4MRUO%2BUYdRyEWvYNXV7tgzLbtl2YVOb1%2Bt2%2FeCNt3p9%2FZNc%2FMKHPzTJYY4hQIDARAJCqYnYHESAQFUCpgqqSvbsemO0VHwKfufi3NmFniFAgAABAqVA%2FI4whd90L4Urtp4%2FXQUNOvq7r1pLqgndcc3ceYP1oxbLD3TZCLRZYDgNX4xqadIoqFFNY%2FSWUGpUrXr3M1JqPO%2B5csSfUX%2FjmdmbAIHpBPwVO52fowkQyCxgqqDMoOtU9%2BVyWqYffeGT6%2BylmAABAgT6KnBzud5jfIjBRsAoqWa8BvYszBdfvfpiNw%2Bb0R1aMYZAjIKKdX4iLIgRULEe1JET741RQ%2FN2%2FeGbbxVfK%2F892polENM9tv21VbdofNjBRoAAgToFhFJ1ajsXAQLrCpgqaF2irDvEp9%2B%2F98yBwYiprBWrjAABAgQ6IXD9ommJOtGRGS7CKKkMiFNWcfeOi4q7tm%2BdshaHE6hHYDgKKsKnGAUVX13b4hqXymnRjVpsVs9%2B%2F1dHm9WgFrRGKNWCTtJEAh0TEEp1rENdDoEuCJjCr95ejEXsb71uWxGBoI0AAQIECKwUuGLrppU%2F%2Br6nAkZJzbbjrR81W39nX18gRkHF6JSYzq6N0%2FCtf4XpPZ448LsiAmNbcwTidWgbT2DhfPcCxhOzNwEC0wp415lW0PEECGQXMIVfdtI1Kzxcfrrv%2Fif3Fd%2B67eo191NIgAABAv0UiDWR9h883s%2BLd9UDAaOkZvdCWNy0sXjkhkuNxJhdFzjzKgIvldPwPTsYAfXOYCq%2BA8dPrLJXP56KKfyEUs3p6whHYwSbbTyBP5%2FvzvqX4125vQkQmJWAUGpW8s5LgEBSwBR%2BSZrKCmK9kBgtdfOVWyo7h4oJECBAoJ0Cm8ub4kUhlJq099o%2BEtkoqUl7fvrjYjqlh65fEEhNT6mGKQSG0%2FDFWlB9GwU1CluYxMicG7cYWTyKV9X7mLpvMuGrrSk1GZyjCBCYWEAoNTGdAwkQqFLAFH5V6q5e953%2F9GLxs698yjR%2Bq%2FN4lgABAr0VaHuoMuuOOxXqzboVk5%2FfKKnJ7aY5Mm5wP7RzoZjfcM401TiWwMQCLx09Xtz506XiyIn3Jq6jLwf%2B4I1jQqkGdHaM2IsPUtjGE4gPQPhdM56ZvQkQmF7AX7jTG6qBAIEKBGIKP1u9AvsPLg%2Bm8av3rM5GgAABAgS6LdDmUM8oqdm8NvcszBePfvJSNwlnw%2B%2BsfxSY23CuQGrEV0O8Vx4p19WyzVbgmfL%2FZ23jC1hPanwzRxAgML2AUGp6QzUQIFCBwHAKvwqqVuUaAjGN37effm2NPRQRINBUgdv%2B5%2FPF95450NTmaVeLBWJNKdvkAm0Opf7x9cOTX7gjJxKItWkeuPajEx3rIAI5BWI9s%2FmNbhmNYnq0DKQee%2B3QKLvap0IBI3snwzX15GRujiJAYDoBf2FM5%2BdoAgQqFLh3944Ka1d1SuC%2BJ1%2B1oH0Kx%2FMEGizwxAtvFHeU03B%2B%2FO9%2BIpxqcD%2B1sWmHl99tY7Mb0%2Ba2hlKxWPzPy7VSbPUJRCB11%2Fat9Z3QmQisI%2BBm9TpAK4ofK0N8o6VWgNT8rZG9k4P%2F%2BbwPH02u50gCBCYVEEpNKuc4AgQqF7j5yi3l%2BkaxuLqtToHDyyeLT3%2FnuSIebQQItENg79Kx9xsaU3FGOPWJb%2F5L8dQrB99%2F3jcEJhU4vHxi0kMdVwq09W8Zi8XX%2B%2FIVSNXr7WyjCQilRnOKvYyWGt2qij2Nkppc1b%2Fzye0cSYDA5AJCqcntHEmAQA0C9%2Bz6sxrO4hRnCsRN7S8%2F%2FvKZT%2FuZAIGGCry2yhz6e5eOlgHzTwchs3CqoR2nWb0QuHzrptZdp8Xi6%2B0ygVS93s42usA1c0ZQjK5VFEZLjaOVb1%2BjpCa3FEhNbudIAgSmExBKTefnaAIEKha49bptFZ9B9SmBR8u1ae5%2Fcl%2Bq2PMECDRIYO%2FSkWRrnnrlkHAqqaNgFIH4oIJtcoHNm86d%2FOAZHfn4Gu8pM2pSZ097%2B2VbTNnX2d5t%2F4XFDWvrSo3ej0ZLjW6Va88wN0pqck2h1OR2jiRAYDoBodR0fo4mQKBigZ2Lc0VM42ebjUCsL%2FW9MpyyESDQbIGV0%2FelWiqcSsl4fj2B%2FQePr7eL8jUErtj64TVKm1lk6r56%2BiVuBn7t6o%2FUczJnITChwNUXnjfhkf08LEZLHThuGvS6ev8fXjtULJlmeGLum1r4N8rEF%2BtAAgQaJSCUalR3aAwBAqsJfGnX5as97bmaBO4pp%2FGLacBsBAg0V2CckSzDcOrjf%2FcToXNzu7QxLRsl8GxMYxvakM2bNjS0Zas364dvvuUG3%2Bo0WZ9dLNdNfWjnQtY6VUagCoFbtl1QRbWdrTNG7vztv%2F1HZ6%2BvSRcWU80aJTV5j8xtOKcwUmpyP0cSIDCdgFBqOj9HEyBQg0CMlGrrIuE18FR%2BisPLJ4vb%2FufzhU%2FKV07tBAQmFpgkOI4g645%2FerEQTk3M3osDV1uvrBcXnukiY8R327YfvHGsbU1uXXsjkHrkhkuL%2BfKGoI1A0wWMpBi%2Fh549tFzECB5btQJ3PLdU7Qk6Xvs1c0ZBdryLXR6BRgv4K7jR3aNxBAiEQHzC%2BJ5dfwZjhgJx8%2FrT33lOMDXDPnBqAimBaUeyCKdSsp4PgadeOQhiCoG2jZKKT53HgvG2agW%2BetXFxWLLRtBVK6L2JgvE9H3WlRq%2Fh2IEj2n8xncb9YiH9%2F3WqN5RsRL77VmYT5R4mgABAtULCKWqN3YGAgQyCJjCLwPilFUIpqYEdDiBigRyjWRZGU59uZy20%2BjIijqsZdXGdI%2B2yQXaNlLqmfJDKLZqBe7ecVFhOrRqjdWeX%2BDWS9y8HlfVNH7jio2%2Bv2n7Rrdaa88bt7Rvzcu1rkcZAQLtEhBKtau%2FtJZAbwXik8Z33GTe%2FVm%2FAARTs%2B4B5ydwtkDukSzx7%2FzBp18vp%2FX7cXFnOb2fcOps8748E30%2FydSQffEZ5Tqv2Hr%2BKLs1Zh%2BjpKrtipi2767tW6s9idoJVCBwy7YLK6i1%2B1XGNH4xoseWTyDCPtP2Te8Zv4%2BM2J3eUQ0ECEwuIJSa3M6RBAjULPA5oVTN4qufTjC1uotnCcxKoMrQ4NFnDgzCqZi%2B83vl97Z%2BCeQOPPuld%2BpqL9%2B6qTWXHZ88jxuotuoEYh0pG4E2CsTaM6bwm6znYho%2F762T2a121Ndf%2FA%2FT9q0GM%2BZzf3XxBWMeYXcCBAjkFRBK5fVUGwECFQrcfOWWIr5ssxcQTM2%2BD7SAwFDg8PLJ4beVPcYUbneUo6Y%2B%2Fnc%2FGYRTRk9VRt2oiu9%2F8tVGtaeNjWnTSClT91X7Cou1O3wqvVpjtVcnMLfhnCLWlrJNJvA3ew9YX2oyutOOilFnP3jjrdOe88NkAkY%2FTubmKAIE8gkIpfJZqokAgRoE7t29o4azOMUoAhFMfeKb%2F1xYb2QULfsQqEYgAqkqR0qd2er4d38qnDo1td%2FepSNn7uLnjgjEKKnob9t0AjsX27MOi6n7puvrtY6OESZ3bb9orV2UEWi8QASrtskETk059%2B%2BCqcn4Bkc99vqhIkad2aYXiKn7btzSnpHc01%2BxGggQaKKAUKqJvaJNBAgkBYyWStLMpCBuiMe0Xvc%2FuW8m53dSAn0XmGUoFFP7feKb%2Fzp4DzC1X%2FdeiUZJTd%2BnOxfnpq%2BkphpM3Vct9F9dfKFRUtUSq70GgRhZYQq%2FyaGXlk8UMWLqSLkmkm08gfjQxDde%2Fs14B9k7KSCQStIoIECgRgGhVI3YTkWAQB4Bo6XyOOas5b5yiifBVE5RdREYTeD5pWOj7VjhXiun9ruznOLP1H4VYtdUdQSORsFOj23qvukNu1KDUVJd6cl%2BX4cp%2FKbv%2F5eOvl3c%2Bdy%2FC6bGoAyzv%2F%2FFm2McYdf1BIx6XE9IOQECdQgIpepQdg4CBLIKxGipK1q0cHjWi29wZRFMfeKb%2F%2BKGdIP7SNO6J9Ck6dWiLRFmfPzvfjx4L4jRUwKqdr7mjJLK029tWgfT1H15%2Bny1WqwltZqK59oqcPcO01BO23eCqdEFnzn4%2B%2BLOn5Yh3gmjy0ZXW3tPU%2Fet7aOUAIH6BIRS9Vk7EwECGQXu3b09Y22qyiUQa9vEdH6m8solqh4CawvUuZ7U2i05vTTatXLtqVifyNYOgS8%2F%2FrK1pDJ11fUtWk%2Fq2UPWD8vU7WdV81cXX3DWc54g0FaBa%2BbOM4Vfhs4bBlMHjp%2FMUFs3q4gPS9z50yWBVObuvfWS9kwtnPnSVUeAQMMEhFIN6xDNIUBgNIE7blowWmo0qtr3itEScTM6bmzGmlM2AgSqE9jbgOn71ru6GD316e%2F8tBxB9ZMipveb5TpY67W17%2BXRVw8%2B%2FXrfGbJdf1vWlIpPotuqE7hx64erq1zNBGoWiCn8br1kvuazdvN0EUzdUU7lJ5g6u38fe%2F1Q8fUXf312gWemFtiz8KdT16ECAgQI5BAQSuVQVAcBAjMReOSz187kvE46mkDc2DSd32hW9iIwiUCEvofLRbPbsg2n9%2FvEN%2F91EFB9u3yPML1fc3ov%2BuLLj%2F%2BiOQ1qeUsikNq8aUMrruKHb77Vina2sZGxmPx8eRPfRqBLArdsu7BLlzPTa1kq%2F46LYMpo1Q%2B64Rsvv1l84%2BXffPCE77IJxO%2BkxZb8bZLtolVEgEBjBfyF3Niu0TACBNYTiLUa2rRew3rX08XyuAkd68ucmg7qeBcv0TURmJlAm0ccxXvDPeVoynh%2FGE75KaCa2UtpEA5GP7Qp5Jyd1mhnbtPfJ8%2BZum%2B0Tp1gr5jqzEagawJxYzu%2BbHkEhsHUw%2Ft%2Bm6fCltZy4PipgO6x1w%2B39Aqa3%2BxY49BGgACBpggIpZrSE9pBgMBEAvfu3jHRcQ6qVyBGTQ1vPNd7Zmcj0F2B51swdd8o%2Bk%2B9cuj99afifcIIqlHU8u0TYWC4R1Boyyewq%2FzgTBu2uAn483IKKVs1AjHVmY1AFwVu2WattNz9%2Bt1XDw6mrOvjdH4xjex%2F%2FZfXjRjL%2FaJaUd%2Fipo2FUGoFiG8JEJi5gL%2BSZ94FGkCAwDQCRktNo1fvsXHDM9aainVlnnrlYL0n79nZwjecjTzpdsd3MUSIgGo4giqm%2F7z%2FyX3WoKrwZbx36ahAqiLftqwn9dLRdyoSUG0IxE1AG4EuCsS6NPMb3U7K3bdPHDgymM4vHvuwHT35XjlV35vFnT9dKo6ceK8PlzyzazS6cWb0TkyAQELgT%2F5QbokyTxMgQKAVAnETMz7lbWuXwB03LRQx0u2Kree3q%2BENbm2EUfc%2F%2BWoZ%2Bh1qcCub17R4LbZxjbp43%2BtLX1%2BxddNgutZbr7u42HPdtua9iFrYohiRFgGgLb9ABFI%2F%2B8qn8ldcQY1xM9BUSRXAqpLAFAKPfvLSVkyP5%2F1jik4e4dAY1XL3jouKhfPbsT7hCJd02i4xOup%2F%2F3%2FfKGL6Qlv1Av%2F3X37celLVMzsDAQKjCzzVzd9uowPYkwCBDgjEaKm4qfzoMwc6cDX9uYTor%2FgSTk3f58Ko6Q3bWMPejkzfN4p9jAp79Jn4OvU%2BH%2B%2F7EU7tunJzsXPR%2FPijGA73Obx8srizHLX6xAtvDJ%2FymFnAelKZQVVHgEAjBW7ZdqFQu8KeidFSP3jjWHH7ZZsH4VSFp6q16pg29m%2F%2F7dem6qtRPQLOxU1u%2F9ZI7lQECIwg4F1pBCS7ECDQfIF7d28vb7C9aZH25nfVWS0chlNxE%2B9Luy4zCuIsodWfiBvL3376tfIm%2Fa%2BsBbM6Uaefjf4%2F3ONPlsYIseEoseEoqngP2XXlVqMv13jlx%2Bio%2B8rRlH1%2B7azBk63o1paM5otpk6wnla3bVUSgdwIxHVh8PXvImoRVdX68T8daU9%2F%2F1dHiru1bW70mUIRRD%2B87WPRlasKqXhOT1GstqUnUHEOAQNUCQqmqhdVPgEAtAnFT8p5dfza42VbLCZ0ku8DwJnP05X1lyOjm8urEMSrq%2B2UAG2GUG8urG%2FXh2b1L%2FVhrYJS%2BPHMUVUydFl8x1V%2BMojJFaDFYx%2B%2FLj%2F%2BiXJ%2Fr6Cik9plCYHP5SeS2jJT6%2BZHjU1ypQwkQIFAMRvDc8dy%2Fo6hYIKa4%2B%2FqLvx4EVG0Lp4RRFb841qk%2B1ja0ntQ6SIoJEJiJgFBqJuxOSoBAFQJf2nW5USNVwNZcZ9xgvqOcWiq2mNrPGjJFGT6dLL5XTlsW020NR4fU3C1O1zCB53s0dd%2B49BG8xNdwqr8IuncuXlgGBVuL6%2F%2F4OG6dbdw%2F3jfiPSPeO7xv1NeDbQmkQuTlY2%2FXB%2BNMBAh0UsBoqXq7dWU4FfZNXnMq1oyKUV5G0tX7GjnzbBFi2ggQINBEAaFUE3tFmwgQmEggPp38yGevLT79necmOt5BzRMYTu03nJ7rczddMrix3LyW5m%2BRICq%2FaZdqNOJl9N6MoDu%2BYorX4RbBwXBEVQRVXVqXKkZTPl1Ob%2Fjg0780mnLY4TU%2BtmXqviBxo7DGF4ZTEeiwQAQjRkvV28ERTsVXTIUX4VRMz3bT1g8XC%2BfP9hZfBFHxu%2BUff3m4OHLivXpRnO0sgRglZeq%2Bs1g8QYBAQwRm%2BxurIQiaQYBAdwTiRmN8%2BVR4d%2Fo0rmTl9Fybyz%2Bub75y82Dtqa5N8Te8mTycyrBbvehqcgrEvwnb5AKr%2FRuLkCqm%2BovH69%2F%2Ffn7yk9R45HBazxgZtf%2BgKdlqpD%2FrVG0aKXWgHE1nI0CAwLQCEYrEze8ISWz1C0QINPyQQfTFLdsuKG7cvKm4Zv78yhsTa14Ng6jv%2F%2BqIIKpy8fFOYJTUeF72JkCgXgGhVL3ezkaAQA0CMVrqE9%2F8V58Qr8F6FqeIdZRixMNw1MNwaq495cLybRrxECOhYl2gmIYtbiTvLR%2BtETWLV1Q7zxmvF1tegeG0f8P3lmHtw7Aq3mviK95nYmTuFeUnkuOx7i0CyWjr8%2BVXhGveO%2BrugfT5IpCK10gbtriR%2BPOjpu9rQ19pI4E2CMTN71jzyDZbgZUB1fzGc4qrLzxvMJLqmrnzisVyFNU0QVX83lj6%2FTvFs4eXi5eOvlN%2BvT34mu0VO3tKwCiplIznCRBoikD9%2FyfdlCvXDgIEOisQN4Tu3b29%2BPLjL3f2Gl3YBwJxgza%2BVt5IjhuDp24kf3ADeVbTc0X4tL%2BcyiJuIr9WjmAY3vg2muGDPvTdeAJCiPG8pt17%2BG92tXpi5GaMrjoVUm0aPMb3l5fPxTYMKOK52He4xfcrA614n1gZSg%2Ff12L%2FeN%2BI94toRzyu3G9Yn8dmCHyuXAexLdvPjxhR15a%2B0k4CbRCIKcJi%2FSCjpZrTWzF93sqQatiyhfM3liPbNhRzG84p5jeeO3iM71duB46fGkl7aprAk8Wxd981CmolUAu%2BN0qqBZ2kiQR6LiCU6vkLwOUT6KrAPbsuGyzuHjfxbP0TWG1qrlCIoGp48%2FjUjeSNxZ9uOvf9G8exz%2FAmcny%2F1hY3hk%2FdSD51M%2Fl3y%2B8ObhYPbxrH4%2FD7tepRRmBcgcPL74x7iP0rEoj3gb1Lw%2BmKDlV0FtW2QSB%2Bt8SI3bZsx979Q1uaqp0ECLRE4IFrP2ptqRb01YHjJ4r4snVXwCip7vatKyPQJQGhVJd607UQIHCawKlp%2FP7ltOf80G%2BBD0JKN4%2F7%2FUpo99XHlI82AgSaJRCB1MrRb81q3dmtiTVAbAQIEMgpEOsZxddwfaOcdauLAIHRBYySGt3KngQIzE7g9DG6s2uHMxMgQCC7QIyKua%2Bcxs9GgACBLgnESEAbAQLNEmjT1H0hF2uB2AgQIJBb4O4dF%2BWuUn0ECIwhYJTUGFh2JUBgpgJCqZnyOzkBAlUL3Lt7x2DKtqrPo34CBAjUJRDrDdkIEGiOQEz7GmsZtmk7Vi5YbyNAgEBugeFoqdz1qo8AgdEEYhpNGwECBNogIJRqQy9pIwECUwnENH4rF5ifqjIHEyBAYMYCH0xDOeOGOD0BAgOBe1s4KvvnRkp59RIgUJHA166%2BuKKaVUuAwFoCexbmB1NorrWPMgIECDRFQCjVlJ7QDgIEKhOIafzaeMOoMhAVEyDQWoG91pNqbd9peHcF2jZKamnZAvfdfTW6MgKzF7hm7rziry9v1%2BjR2atpAYHpBe7abvrM6RXVQIBAXQJCqbqknYcAgZkK3LPrstZNrTNTMCcnQKCRAq%2BZuq%2BR%2FaJR%2FRW446aFIqbva9MmlGpTb2krgXYK3LV9azG%2F0e2mdvaeVrdRINZzW9y0oY1N12YCBHoq4K%2BEnna8yybQRwHT%2BPWx110zgW4J7F060q0LcjUEWi7QxpHYB46fbLm65hMg0HSBuQ3nFEZtNL2XtK8rAoubNhb%2F7bLNXbkc10GAQE8EhFI96WiXSYBAMfgk8%2BOfvx4FAQIEWitg%2Br7Wdp2Gd1CgjaOkohuMlOrgi9ElEWigwO3lTfIbt7RrJGkDGTWJwLoCg5GJZRBsI0CAQJsEvGu1qbe0lQCBqQVi3Yd7dl0%2BdT0qIECAwCwE9pu%2BbxbszklgVYE2jpKKCzl68r1Vr8eTBAgQyC3wtasvzl2l%2BggQWCGwZ2G%2BiC8bAQIE2iYglGpbj2kvAQJTC3zrtqusLzW1ogoIEJiFwN6lo7M4rXMSIHCGQFtHScVlHDh%2B4oyr8SMBAgSqEbhm7rxyGr%2Bt1VSuVgI9F4h120yT2fMXgcsn0GIBoVSLO0%2FTCRCYXCDWl2rbwuSTX60jCRDogoCp%2B7rQi66hKwJtHSUV%2FkdOGCnVldeh6yDQBoG%2FvnxLEWve2AgQyCsQgdTipg15K1UbAQIEahIQStUE7TQECDRLIAIp60s1q0%2B0hgCBtQVeM3Xf2kBKCdQk0OZRUkF0YPlkTVJOQ4AAgaKYK9e6eeDaj6IgQCCjQKzXFuu22QgQINBWAaFUW3tOuwkQmFpg5%2BJc8a3brp66HhUQIECgDoG9S0fqOI1zECCwjkCbR0nFpR199911rlAxAQIE8grEDfQYMWUjQGB6gZi274FrPzZ9RWogQIDADAWEUjPEd2oCBGYvcM%2Buy4p7dl0%2B%2B4ZoAQECBNYRMH3fOkCKCdQg0PZRUkFk%2Br4aXihOQYDAWQKxtlSsMWUjQGA6ga9edbFp%2B6YjdDQBAg0QEEo1oBM0gQCB2Qp867aripuv9Mm92faCsxMgsJ7AftP3rUeknEClAjH1b%2BtHSZ20nlSlLxKVEyCQFBhO4xejPGwECEwmsGdhvogvGwECBNou4K%2BBtveg9hMgkEXg8c%2FvLOJmk40AAQJNFDhcrgGzd%2BloE5umTQR6IxCBVNv%2FVjhywtR9vXnBulACDRSIkVJ3bb%2BogS3TJALNF1jctNG%2Fn%2BZ3kxYSIDCigFBqRCi7ESDQbYHNmzYUP%2FrCDa2%2F2dTtXnJ1BPorYD2p%2Fva9K2%2BGQIRRMXVf27dj7xop1fY%2B1H4CbRe4%2FbLNxS3bLmj7ZWg%2FgdoFHrr%2BEtP21a7uhAQIVCUglKpKVr0ECLROIG44Pf7564vN5SeQbAQIEGiSwO%2BWjW5oUn9oS%2F8E4oMrXdh%2B9473ki70o2sg0HaBB679WHlz3f9ztb0ftb8%2Bgbt3XGRNtvq4nYkAgRoEhFI1IDsFAQLtEdi5ODcIptrTYi0lQKAPAk%2B9crAPl%2BkaCTRS4N7dO4ykbmTPaBQBAm0ViPWlYtSHjQCB9QViZOFd27euv6M9CBAg0CIBoVSLOktTCRCoR%2BDmK7cUj3z22npO5iwECBAYQcB6UiMg2YVABQIxivq%2Bci0pGwECBAjkFYj1pb529cV5K1UbgY4JxIjCr161rWNX5XIIECBQFEIprwICBAisIhDrRsQno20ECBBogsDepWNNaIY2EOidQFem7etdx7lgAgRaIRDrS%2F315Vta0VaNJFC3wPzGc4pHbrjUOlJ1wzsfAQK1CAilamF2EgIE2igQn4wWTLWx57SZQLcEDi%2BfLA4vn%2BjWRbkaAi0Q6OK0fQeOn2yBvCYSINAnga9e9RFr5fSpw13ryAJfvepigdTIWnYkQKBtAkKptvWY9hIgUKuAYKpWbicjQGAVgb1LR1Z51lMECFQpEFP5mravSmF1EyBA4AOBWF8qpimzESBwSuDuHRcVexbmcRAgQKCzAkKpznatCyNAIJeAYCqXpHoIEJhE4HlT903C5hgCEwvEOlLWlpyYz4EECBAYWyACqUduWCxiujIbgb4L3H7ZluKu7Vv7zuD6CRDouIDf%2BB3vYJdHgEAeAcFUHke1ECAwvsD%2Bg8vjH%2BQIAgQmFohAKoIpGwECBAjUJxDB1EPXL9R3Qmci0ECBa%2BbOK7529Uca2DJNIkCAQF4BoVReT7URINBhAcFUhzvXpRFosMDepaMNbp2mEeiWQKwjFVP32QgQIECgfoEbt2wqb8hfXP%2BJnZFAAwQEsw3oBE0gQKA2AaFUbdRORIBAFwQEU13oRddAoF0Ce03f164O09rWCnxp12XWkWpt72k4AQJdEbj9ss1FrKdjI9AngVNTWF5arq22oU%2BX7VoJEOixgFCqx53v0gkQmEwggilrTUxm5ygCBMYTOLx8sji8fGK8g%2BxNgMDYAjsX54oHb7t67OPadsDC%2BW52ta3PtJdAHwViPR3BVB97vp%2FXLJDqZ7%2B7agJ9FxBK9f0V4PoJEJhI4I6bFoqffeVTxeZy7nMbAQIEqhLYu3SkqqrVS4DAHwVi%2FajHP389DwIECBBokEAEU399uelUG9QlmlKBwPzGc8q11C4xQqoCW1USINBsAaFUs%2FtH6wgQaLBAfKr6Z1%2F5C4uhN7iPNI1A2wWeN3Vf27tQ%2BxsuEIHUj75wg9%2FlDe8nzSNAoJ8CX73qI8Wehfl%2BXryr7rxABFKP3HBpcc3ceZ2%2FVhdIgACBMwWEUmeK%2BJkAAQJjCLiZNQaWXQkQGFtg%2F8HlsY9xAAECownEaOe%2BBVIxRZCNAAECbRJ44NqPCqba1GHaOpKAQGokJjsRINBhAaFUhzvXpREgUI9ABFMxld%2Be67bVc0JnIUCgNwJ7l4725lpdKIE6BfoYSNXp61wECBDIKSCYyqmprlkLCKRm3QPOT4BAEwSEUk3oBW0gQKD1Aps3bRisR3Hv7h2tvxYXQKBPAjdfuaW4d%2Ff2xl7yXtP3NbZvNKy9AsNAKqbhtREgQIBAOwQEU%2B3oJ61cW0AgtbaPUgIE%2BiOwoT%2BX6koJECBQvcB95c3tCKi%2B%2FPjL1Z%2FMGQgQmFggRjh%2B67arGj3C8fDyyeLw8omJr9GBBAicLdD3QMr0fWe%2FJjxDgEB7BCKYivexh%2Ff9tj2N1lICfxSI1%2B5D119iDSmvCAIECJQCRkp5GRAgQCCzwD27Liv%2B13%2F%2FS4umZ3ZVHYFcAl8q%2F422YcrNvUtHcl2yeggQKAX6HkgNXwTxKW0bAQIE2ipw1%2Fatxd07Lmpr87W7pwIRSD1yw6UCqZ72v8smQOBsAf9HcraJZwgQIDC1QIzCiMXTrTM1NaUKCGQTiKn6fvSFTxYP3nb1YERjtoorquh5U%2FdVJKvaPgoMfy%2Bbsq8o5s49t48vAddMgECHBARTHerMHlzKMJBaLGdUsREgQIDAKQGhlFcCAQIEKhKIG2CPf%2F76cr0a60xVRKxaAiMJxOiIb5VBVARSEUy1ZXvqlUNtaap2Emi0gEDq9O4xUup0Dz8RINBOgQimYjo%2FG4EmC1wzd17xf37qsnLaSYFUk%2FtJ2wgQqF9AKFW%2FuTMSINAzgVhnKqYKi5tiNgIE6hWIqfpiOs2YVrNtm%2FWk2tZj2ttEgRgZFSOX%2FQ7%2BoHcW3Bj7AMN3BAi0WmDPwnzxfw1u%2BG9s9XVofDcF4vX5yCcvLeY3uPXazR52VQQITCPgnXEaPccSIEBgRIHhTbE7bloY8Qi7ESAwjUDbpupb7Vr3mr5vNRbPERhZ4HPl79wYISmQOp1s7lz%2FC3i6iJ8IEGizQIxEeeSGxXIkimCqzf3YtbbHumcxkk8g1bWedT0ECOQS8H8kuSTVQ4AAgXUE4qbYI5%2B9dvAV04nZCBDILxD%2FzmLazLZN1XemRARSRkqdqeJnAqMLxJSdj5a%2FczcbFXQW2oK%2FQc4y8QQBAu0WiEAqRkzdsu2Cdl%2BI1rdeIKbI%2FT%2F%2Bt48WMb2kjQABAgTSAkKptI0SAgQIVCIQo6V%2B9pW%2FaNXaNpVAqJRARoEIemP9tpgqc8912zLWPJuqdi5eOAiw27QG1myknJXA6QLxXhChdBun7Dz9Sqr7yZpS1dmqmQCB2QnMlVOkPXT9QhEjVGwEZiEQ4egjN1xa3HrJ%2FCxO75wECBBolcCf%2FKHcWtVijSVAgECHBB58%2BvXi%2FidfNSKiQ33qUuoViBvQsW5U3IDu6oiIvUtHi2%2BX7xWPPnOgXlxnI9AygQhxY0Sy6frW7rgfvvlW8Td7vZ%2BsraSUwOwEHi3XoLlxi7Vop%2BmBJw4cKf7%2BF28WR068N001jiUwskD8m31o54Lp%2BkYWsyMBAj0XeEoo1fNXgMsnQGD2AvsPLg%2BCKTecZ98XWtAugRh1GFN0dTWMOrM3hu8VT71yqIjvbQQIfCAQ4fSD5fuBbX2Bl4%2B9XfyXf359%2FR3tQYDATASEUnnYl5ZPFHf%2BdKmIRxuBKgVidJ7p%2BqoUVjcBAh0UEEp1sFNdEgECLRWIUCpGTbnZ3NIO1OzaBCKMunf39l6Phoj3ixg9FaOobAT6LDBcr9FUl6O%2FCuIG7Wd%2Bsn%2F0A%2BxJgECtAkKpvNx%2F%2F4vfFP%2Fw2qG8laqNQCkQ0%2FU9cO1HjWz0aiBAgMD4AkKp8c0cQYAAgeoEIpD69tO%2FLB58%2BrXqTqJmAi0ViLWivnXbVb0Oo87sOlP7nSni5z4JxOio%2B8q15PoyWjJn3%2F7np%2FaZ1ionqLoIZBQQSmXE%2FGNVMZ3fd189aNRUftre1mi6vt52vQsnQCCPgFAqj6NaCBAgkFcgwqk7%2F%2BnFIqbpshHou4CRUeu%2FAuI9I94vjLZc38oe7RcwOmr6PvzMj%2FcXS8dNaTW9pBoI5BcQSuU3jRpjlOjXX%2Fx18ewhUyBXI9yPWuc3nlNO1XdRcftlm%2Ftxwa6SAAEC1QgIpapxVSsBAgTyCJjSL4%2BjWtonsLmcDuOOmy4pYiRE3IC2jS4Q4dT3yun9rFM3upk92yNwbzky6p7yfcHoqOn67IvPHyh%2B8MZb01XiaAIEKhEQSlXC%2Bn6lj71%2BuBw19VujRd8X8c2oAjE66oFrP1ZO27dh1EPsR4AAAQKrCwilVnfxLAECBJol8GC5dkysH2O9qWb1i9bkF4gwKoIoN52ntz28fLJ44oU3BgGVUZfTe6phtgKxZtQjn71WSJ2pG77x8ptF3Ji1ESDQPAGhVPV9YtRU9cZdOoPRUV3qTddCgEBDBIRSDekIzSBAgMC6AhFIPfrMr8rpufatu68dCLRNQBhVbY%2FF%2B0cE20%2B88KZwu1pqtWcWMFVfZtA%2FVvfY64eKb7z8m2oqVysBAlMJCKWm4hvrYGtNjcXVy52Njuplt7toAgSqFxBKVW%2FsDAQIEMgrEDeXY90YU3PldVXbbARi9EOMjNpz3bbZNKCHZx1O7xePRl%2F28AXQkkseBtX37d7ekha3q5k%2FfPOt4m%2F2HmhXo7WWQE8EhFL1dnSMmvruqweLCKhsBIYCMTrqf%2FynjxW3bLtg%2BJRHAgQIEMgnIJTKZ6kmAgQI1CsgnKrX29nyCcTN5j3XXVx87qaFIkIp2%2BwEYuTU98sp%2FuLxcHlTxkZg1gLDMMoUntX2RNyE%2FcxP9ld7ErUTIDCRgFBqIrapD3rp6NvFF5%2F%2FVRHvj7Z%2BC9x%2B2Zbirh1bi%2FkN5%2FQbwtUTIECgOgGhVHW2aiZAgEA9AsNwyqiHerydZXIBN5snt6vjSAFVHcrOkRLw%2FpCSqe75a%2F%2Bf%2F6%2B6ytVMgMDEAkKpiemyHGhKvyyMrazEVH2t7DaNJkCgnQJCqXb2m1YTIEDgbIEIpyKYiqn9TMl1to9nZiMQN5p3Ll5Y3Lt7h1FRs%2BmCic46DKiE3RPxOWgMAWHUGFiZd%2F3Mj%2FcXS8eNCMjMqjoCUwsIpaYmnLqCGC31j7%2F8XfEPrx2aui4VNF%2Fgmrnziq9dfXERoZSNAAECBGoREErVwuwkBAgQqFkg1psSTtWM7nSnCcS0fLeW60TdUU7Rt3nThtPK%2FNAugQimvle%2Bpwio2tVvTW%2FtzsW5wRSe3iNm11NffP5A8YM33ppdA5yZAIFVBYRSq7LM5EnrTc2EvbaTLpYfnrtr%2B9Ziz8J8bed0IgIECBAYCAilvBAIECDQZYHhzeQIqWwEqhaIEQ933HTJIIyyVlTV2rOpf%2B%2FS0UE4FetQxfuLjcC4AvHeYOTkuGrV7P%2BNl98sHnv9cDWVq5UAgYkFhFIT01V2oHCqMtqZVDy%2F8Zwi1o36b5dttm7UTHrASQkQIFAIpbwICBAg0AcBU%2Fv1oZdnc42CqNm4N%2BGsh5dPnhZQmTa0Cb3SzDaYoq%2BZ%2FRLrpnz9xV83s3FaRaDHAkKp5na%2BcKq5fTNKy4RRoyjZhwABArUICKVqYXYSAgQINEjA6KkGdUZLmxI3mPdcd%2FFg6q2Ygsv0fC3tyMzNjlFU8fX9F94chFWHy%2FUYbP0VWPk%2BYeRkM18HLx97u%2Fgv%2F%2Fx6MxunVQR6LCCUan7nC6ea30crWxhrRt1ejooyTd9KFd8TIEBgpgJCqZnyOzkBAgRmKBCjHJ4op%2BAarhUzw6Y4dQsEVo6IEkS1oMMa0MThVH9Pl9P8RRgupGpAp1TchHif2Ll44SCw3lOuKSewrhh8yuqPnnyv%2BNSP9k1Zi8MJEMgtIJTKLVpdfRFO%2FeMvf1euz3esiO9tzRK4ccum4u4dFxXxaCNAgACBRgkIpRrVHRpDgACBGQkMp%2FcTUM2oAxp62iu2nl%2BOiNpmjaiG9k%2FbmrUypIrvTffXth5cvb2CqNVd2vLsZ368v1g67kZqW%2FpLO%2FshIJRqZz%2FHlKixTt9LR99u5wV0pNUxRd%2Btl8wXt2y7UBjVkT51GQQIdFJAKNXJbnVRBAgQmEJAQDUFXssPHd5cvrUMoiKMilDKRqAqgXiv2bt0rHj6lYODaf%2Fie6OpqtLOW%2B%2FKwNrIyby2ddd2pBwtdaz8shEg0ByBCzecU8yXX7Z2CkQoFeHUD988Vhw54f21rl6M0VC3bLuguHXhT%2F37qQvdeQgQIDC5gFBqcjtHEiBAoPsCMcVfTLv1%2FXKav3g0sqF7fR5rvcRN5Qii3FzuXv%2B27YpOjaA6LqhqWMdFYB3ryF1fvlcIrBvWOZpDgAABAo0ViNFT8fXsoeXGtrHNDTMqqs29p%2B0ECPRcQCjV8xeAyydAgMBYAhFMxU3jYUg11sF2boRABE8RRO26cuvg0ZovjegWjVhDYBhUPb90ZDCy6tQIq6NrHKFoWoEYCXVz%2BR4hhJpW0vEECBAgQKAYrDcVwZSAavpXgyBqekM1ECBAoAECQqkGdIImECBAoJUCMYpqGFDFYwRWtmYJDKfjMxKqWf2iNXkEzgyrYuo%2FUwCObxsB1M7F%2BTKo3lJO2blJWD0%2BoSMIECBAgMDIAkvl3ysCqpG5BjsKosbzsjcBAgRaICCUakEnaSIBAgRaIzAcSfV0GVDF99aHqa%2FrIoA6Nbphy2B0Q4xyiJ9tBPomMAzM4zFGV638ef%2FB4719XxqGT%2FF4eRk%2BRVhtys6%2B%2FetwvQQIECDQJIFY1%2B%2B5cgTVD944NgiqIrCynRKINaJu2vrhIh7jy0aAAAECnRIQSnWqO10MAQIEGiYwHMnw9CsHB6OqjGLI00ErR0DF9FrDm8t5alcLgW4LREgVUwAOH197%2F%2FtTgdWp59sXXkXYdOq9Ya583DAInmLk0zB4MlVnt1%2FXro4AAQIE2i%2Fw0tG3y3Dq94OAKkZTHTnxXvsvasQruGbuvEH4FEHUJ8sQan7DOSMeaTcCBAgQaKGAUKqFnabJBAgQaLXAcNRCBFZxMzgehVWrd6mRDau7eJZAXQLxfjUMr%2BKcEWbFFu9dsQ3LP%2Fj%2B9E84D%2Fcf7DzifyJYGgZIK7%2BP94PYYpRTbBE4xdep742KHED4DwECBAgQ6JBAhFSngqrlwWN834UtpuOL0U%2FXzJ0%2FeLy6DKSEUF3oWddAgACBkQWEUiNT2ZEAAQIEKhUYhlXxGFNuDYOquKkbU251cVtrZMPwBnQXr9s1ESBAgAABAgQIECAwvkCMoIpp%2FoaB1VL5%2F04Hjp%2F%2BoZjxa63miAifFs7fWIZP55VfHyoWN31o8P3C%2BRuqOaFaCRAgQKAtAkKptvSUdhIgQKDvAhFMrZxy63fl%2F4ydWh8mRjKc%2BOOIhVPPzcrq1KiGcwdTaMVIh5WjGGJ0Q5QPgyih06x6yXkJECBAgAABAgQIdEcg1qY6UP7%2F0IHjJ8vA6p3y61RQFdP%2FDb%2Bv4mojcIrtz%2Bc%2FVMxtOLcMoDaUwdPG97%2BET1Woq5MAAQKdEBBKdaIbXQQBAgQInCUwHF01DKyGO6Sm04oRWhF0%2FemKqbOGx6x8HAZN8dzw%2BwightNtrdzX9wQIECBAgAABAgQIEGiCQIRWR068WxwtQ6zY4jF%2BXm%2BLoCm2uXKdp%2FmN5xYXxqM1n9ZjU06AAAECaQGhVNpGCQECBAgQIECAAAECBAgQIECAAAECBAgQIECAQCaBp87JVJFqCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIEk3aJoQAAQABJREFUCBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkEtAKJVLUj0ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJJAaFUkkYBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBALgGhVC5J9RAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECCQFhFJJGgUECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQK5BIRSuSTVQ4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgkBQQSiVpFBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECOQSEErlklQPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAUkAolaRRQIAAAQIECBAgQIAAAQIE%2Fv%2F27JAIYCCAgSCpf00voZJaA0F%2FcHFmApYeAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAA%2BkZoQAAA22SURBVAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITAFRatIYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEKgFRqpL0Q4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgMAVEqUljIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQqAREqUrSDwECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBQQpSaNgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAoBIQpSpJPwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAlNAlJo0BgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgUpAlKok%2FRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEwBUWrSGAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCoBUaqS9EOAAAECBAgQIECAAAECBAgQIECAAAECBAgQIDAFRKlJYyBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEKgERKlK0g8BAgQIECBAgAABAgQIECBAgAABAgQIECBAgMAUEKUmjYEAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKASEKUqST8ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJTQJSaNAYCBAgQIECAAAECBAgQIECAAAECBAgQIECAAIFKQJSqJP0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAhMAVFq0hgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQqAVGqkvRDgAABAgQIECBAgAABAgQIECBAgAABAgQIECAwBUSpSWMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCoBESpStIPAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFBClJo2BAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgEhClKkk%2FBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECU0CUmjQGAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBSkCUqiT9ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQITIHnX85cDQQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgTuBd4Ps676%2BbqmqqgAAAAASUVORK5CYII%3D%22%2F%3E%0D%0A%3C%2Fdefs%3E%0D%0A%3C%2Fsvg%3E%0D%0A";

function renderHomeCarousel() {
  const carousel = document.getElementById('hm2Carousel');
  if (!carousel) return;
  const expiring = cpnExpiringSoon(7).slice(0, 4);
  if (!expiring.length) return;
  carousel.innerHTML = expiring.map(c => `
    <div class="hm2-ticket" data-action="go-detail" data-id="${c.id}" onclick="ACT['go-detail']&&ACT['go-detail']({target:this})">
      <img class="hm2-ticket-svg-img" src="${INLINE_VERTICAL_COUPON_SVG_SRC}" alt="${c.brand} ${cpnBenefitLabel(c)} 할인 ${cpnDday(c.expiry)}">
    </div>`).join('');
  // 도트 개수 맞추기
  const dots = document.getElementById('hm2Dots');
  if (dots) dots.innerHTML = expiring.map((_, i) => `<span class="hm2-dot${i===0?' active':''}"></span>`).join('');
}

function renderHomeList() {
  const list = document.getElementById('hmH4List');
  if (!list) return;
  const noResult = document.getElementById('hmNoResult');
  const moreBtn = document.getElementById('hmMoreBtn');
  const cpns = USE_COUPONS;
  list.innerHTML = cpns.map((c, i) => `
    <div class="hm-h4-card" data-cat="${c.channel==='온라인'?'online':c.channel==='오프라인'?'offline':'both'}"
      data-extra="${i>=3?'true':'false'}"
      data-action="go-detail" data-id="${c.id}"
      onclick="ACT['go-detail']&&ACT['go-detail']({target:this})"
      style="display:${i<3?'flex':'none'};flex-direction:column">
      <div class="hm-h4-head">
        <span class="hm-badge-unused">${cpnDday(c.expiry)}</span>
        <button class="hm-h4-fav" onclick="event.stopPropagation();toggleCpnFav('${c.id}',this)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${c.fav?'currentColor':'none'}" stroke="${c.fav?'var(--color-red-400)':'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:${c.fav?'var(--color-red-400)':'currentColor'}"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="hm-h4-body">
        <div class="hm-h4-img" style="background:${cpnBgColor(c.brand)};color:white;display:flex;align-items:center;justify-content:center;border-radius:50%;width:48px;height:48px;font-weight:700">${cpnInitial(c.brand)}</div>
        <div class="hm-h4-info">
          <div class="hm-h4-brand">${c.brand}</div>
          <div class="hm-h4-title">${c.name}</div>
          <div class="hm-h4-date">${c.expiry} 까지</div>
        </div>
      </div>
      <hr class="hm-h4-sep">
      <button class="hm-h4-save" onclick="event.stopPropagation()">사용하기</button>
    </div>`).join('') + `<div id="hmNoResult" style="display:none;padding:40px 0;text-align:center;color:var(--gray-400)"><div style="font-size:var(--font-size-body);font-weight:var(--font-weight-bold)">검색 결과가 없습니다</div></div>`;
  if (moreBtn) moreBtn.style.display = cpns.length > 3 ? '' : 'none';
}

function toggleCpnFav(id, btn) {
  const cpn = USE_COUPONS.find(c => c.id === id);
  if (!cpn) return;
  cpn.fav = !cpn.fav;
  const svg = btn && btn.querySelector('svg');
  if (svg) {
    svg.setAttribute('fill', cpn.fav ? 'currentColor' : 'none');
    svg.style.color = cpn.fav ? 'var(--color-red-400)' : '';
  }
  // 찜 페이지 갱신
  if (document.getElementById('wshCpnList')) renderWishlist();
}

/* 홈 필터 (기존 filterHmCpn override) */
function filterHmCpn(cat, btn) {
  const cards = document.querySelectorAll('#hmH4List .hm-h4-card');
  let vis = 0;
  cards.forEach(card => {
    const cc = card.dataset.cat;
    const show = cat === 'all' || cc === cat || cc === 'both';
    card.style.display = (show && vis < 3) ? 'flex' : 'none';
    if (show) vis++;
    card.style.flexDirection = 'column';
  });
  const noResult = document.getElementById('hmNoResult');
  if (noResult) noResult.style.display = vis === 0 ? 'block' : 'none';
  // 더보기 버튼
  const moreBtn = document.getElementById('hmMoreBtn');
  const total = Array.from(cards).filter(c => cat==='all'||c.dataset.cat===cat||c.dataset.cat==='both').length;
  if (moreBtn) moreBtn.style.display = total > 3 ? '' : 'none';
  if (btn) { document.querySelectorAll('.hm2-chip').forEach(c=>c.classList.remove('active')); btn.classList.add('active'); }
}

function hm2ShowMore() {
  const extras = document.querySelectorAll('#hmH4List .hm-h4-card[data-extra="true"]');
  extras.forEach(c => { c.style.display = 'flex'; c.style.flexDirection = 'column'; });
  const btn = document.getElementById('hmMoreBtn');
  if (btn) btn.style.display = 'none';
}
/* ── 혜택(points-hub) 쿠폰 렌더링 ── */
const CAT_MAP = {
  '카페/디저트':'cafe', '패션/의류':'fashion', '뷰티/건강':'beauty',
  '리빙/마트':'mart', '푸드/배달':'delivery', '문화/여가':'culture', '도서/교육':'book'
};
const CAT_LABEL = {
  '카페/디저트':'카페', '패션/의류':'패션', '뷰티/건강':'뷰티',
  '리빙/마트':'마트', '푸드/배달':'배달', '문화/여가':'문화', '도서/교육':'도서'
};

function renderPhCpnList(filterCat) {
  const list = document.getElementById('phCpnList');
  if (!list) return;
  let cpns = [...USE_COUPONS].sort((a, b) => cpnDdayNum(a.expiry) - cpnDdayNum(b.expiry));
  if (filterCat && filterCat !== 'all') {
    cpns = cpns.filter(c => {
      if (filterCat === 'food') return c.cat === '푸드/배달';
      return CAT_MAP[c.cat] === filterCat;
    });
  }
  const countLabel = document.getElementById('phCpnCountLabel');
  if (countLabel) countLabel.textContent = '보유 쿠폰 32장';

  const heartSvg = (fav) => `<svg viewBox="0 0 24 24"
    fill="${fav ? 'var(--color-red-400)' : 'none'}"
    stroke="${fav ? 'var(--color-red-400)' : 'var(--color-gray-300)'}"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>`;

  function renderCard(c) {
    const dnum = cpnDdayNum(c.expiry);
    const urgent = dnum >= 0 && dnum <= 7;
    const ddayText = dnum === 0 ? 'D-DAY' : dnum < 0 ? '만료' : 'D-' + dnum;
    const badgeClass = dnum === 0 ? 'filled' : 'outlined';
    const channelLabel = cpnChannelBadge(c.channel);
    const dateLabel = c.expiry.replace(/-/g, '.') + '까지';
    const logoSrc = BRAND_LOGO[c.brand] || HSS_BRAND_LOGO[c.brand] || '';
    const logoHtml = logoSrc
      ? `<img src="${logoSrc}" alt="${c.brand}">`
      : cpnInitial(c.brand);
    const logoStyle = logoSrc ? 'background:var(--surface)' : `background:${cpnBgColor(c.brand)}`;
    const condText = c.cond === '없음' ? '조건 없음' : c.cond;

    if (urgent) {
      return `
      <div class="ph-cpn-card ticket" data-cat="${CAT_MAP[c.cat]||'etc'}" data-id="${c.id}"
        onclick="ACT['go-detail']&&ACT['go-detail']({target:this})">
        <div class="ph-dday-badge ${badgeClass}">${ddayText}</div>
        <div class="ph-cpn-content">
          <div class="ph-cpn-head">
            <span class="ph-cpn-brand">${c.brand}</span>
            <button class="ph-cpn-fav${c.fav?' on':''}" type="button" aria-label="찜하기"
              onclick="event.stopPropagation();toggleCpnFav('${c.id}',this)">
              ${heartSvg(c.fav)}
            </button>
          </div>
          <div class="ph-cpn-body">
            <div class="ph-cpn-logo-wrap">
              <div class="ph-cpn-logo" style="${logoStyle}">${logoHtml}</div>
              <span class="ph-ch-badge">${channelLabel}</span>
            </div>
            <div class="ph-cpn-info">
              <div class="ph-cpn-title">${c.name}</div>
              <div class="ph-cpn-cond">${condText}</div>
              <div class="ph-cpn-date">${dateLabel}</div>
            </div>
          </div>
        </div>
      </div>`;
    } else {
      return `
      <div class="ph-cpn-card normal" data-cat="${CAT_MAP[c.cat]||'etc'}" data-id="${c.id}"
        onclick="ACT['go-detail']&&ACT['go-detail']({target:this})">
        <div class="ph-cpn-head">
          <span class="ph-cpn-brand">${c.brand}</span>
          <button class="ph-cpn-fav${c.fav?' on':''}" type="button" aria-label="찜하기"
            onclick="event.stopPropagation();toggleCpnFav('${c.id}',this)">
            ${heartSvg(c.fav)}
          </button>
        </div>
        <div class="ph-cpn-body">
          <div class="ph-cpn-logo-wrap">
            <div class="ph-cpn-logo" style="${logoStyle}">${logoHtml}</div>
            <span class="ph-ch-badge">${channelLabel}</span>
          </div>
          <div class="ph-cpn-info">
            <div class="ph-cpn-title">${c.name}</div>
            <div class="ph-cpn-cond">${condText}</div>
            <div class="ph-cpn-date">${dateLabel}</div>
          </div>
        </div>
      </div>`;
    }
  }

  const urgentCpns = cpns.filter(c => { const d = cpnDdayNum(c.expiry); return d >= 0 && d <= 7; });
  const normalCpns = cpns.filter(c => { const d = cpnDdayNum(c.expiry); return d < 0 || d > 7; });

  let html = '';
  if (urgentCpns.length > 0) {
    // 티켓 카드 → 가로 캐러셀 래퍼
    html += `<div class="ph-ticket-carousel" id="phTicketCarousel">
      ${urgentCpns.map(renderCard).join('')}
    </div>`;
    // 인디케이터 (카드 수 >= 2일 때만)
    if (urgentCpns.length > 1) {
      html += `<div class="ph-ticket-dots" id="phTicketDots">
        ${urgentCpns.map((_, i) => `<span class="ph-ticket-dot${i===0?' on':''}"></span>`).join('')}
      </div>`;
    }
  }
  html += normalCpns.map(renderCard).join('');

  list.innerHTML = html;

  // 캐러셀 자동 슬라이드 초기화
  if (urgentCpns.length > 1) {
    _initPhTicketCarousel();
  }
}

/* ── 혜택 쿠폰 티켓 캐러셀 자동 슬라이드 ── */
let _phTicketTimer = null;
let _phTicketIdx   = 0;

function _initPhTicketCarousel() {
  if (_phTicketTimer) clearInterval(_phTicketTimer);
  _phTicketIdx = 0;
  _phTicketTimer = setInterval(() => {
    const car  = document.getElementById('phTicketCarousel');
    const dots = document.getElementById('phTicketDots');
    if (!car) { clearInterval(_phTicketTimer); return; }
    const cards = car.querySelectorAll('.ph-cpn-card.ticket');
    if (!cards.length) return;
    _phTicketIdx = (_phTicketIdx + 1) % cards.length;
    // 스크롤
    const cardW = car.offsetWidth;
    car.scrollTo({ left: _phTicketIdx * cardW, behavior: 'smooth' });
    // 인디케이터 업데이트
    if (dots) {
      dots.querySelectorAll('.ph-ticket-dot').forEach((d, i) => d.classList.toggle('on', i === _phTicketIdx));
    }
  }, 2500);
}

/* ── 혜택(points-hub) 포인트 렌더링 ── */
function renderPhPtsList() {
  const grid    = document.getElementById('ptsSvcGrid');
  const totalEl = document.getElementById('ptsTotalNum');
  const expiryEl= document.getElementById('ptsTotalExpiry');
  if (!grid) return;

  // 합계 & 가장 빠른 만료일
  const total = USE_POINTS.reduce((s, p) => s + p.balance, 0);
  if (totalEl) totalEl.textContent = total.toLocaleString();
  if (expiryEl) {
    const earliest = USE_POINTS.reduce((min, p) => p.expiry < min ? p.expiry : min, USE_POINTS[0].expiry);
    expiryEl.textContent = earliest;
  }

  const heartSvg = `<svg width="16" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

  // 소멸 임박(urgent) 먼저, 그 다음 일반 — 각각 expiry 오름차순
  const sorted = [...USE_POINTS].sort((a, b) => {
    const au = cpnDdayNum(a.expiry) <= 30, bu = cpnDdayNum(b.expiry) <= 30;
    if (au !== bu) return au ? -1 : 1;
    return a.expiry < b.expiry ? -1 : 1;
  });

  const items = sorted.map((p, i) => {
    const dday   = cpnDday(p.expiry);
    const dnum   = cpnDdayNum(p.expiry);
    const urgent = dnum >= 0 && dnum <= 30;
    const logoBg = cpnBgColor(p.issuer) || 'var(--color-primary)';
    const pointCat = getPointCategory(p);

    // 일반 카드 앞에 구분선 (바로 앞 카드가 urgent였거나 같은 일반 카드들 사이)
    const prevUrgent = i > 0 && cpnDdayNum(sorted[i-1].expiry) <= 30;
    const divider = !urgent && i > 0 ? `<hr class="pts-list-divider">` : '';

    // 브랜드 로고 이미지 맵
    const PTS_LOGO_MAP = {
      '해피포인트': '로고/해피포인트.svg',
      '배민포인트': '로고/배민.svg',
      '네이버페이': '로고/네이버포인트.svg',
      '네이버페이 포인트': '로고/네이버포인트.svg',
      'CJ ONE': '로고/CJ.svg',
      '엘포인트': '로고/L포인트.svg',
      'GS&POINT': '로고/GS&POINT.svg',
      'GS25': '로고/GS25 logo.svg',
    };
    const logoFile = PTS_LOGO_MAP[p.issuer] || PTS_LOGO_MAP[p.name] || '';
    const logoInner = logoFile
      ? `<img src="${logoFile}" alt="${p.issuer}">`
      : p.issuer.charAt(0);

    if (urgent) {
      return `${divider}
    <div class="pts-list-card urgent" data-cat="${pointCat}" onclick="showPointsDetail('${p.id}')">
      <img class="pts-card-svg-img" src="${INLINE_POINT_CARD_SVG_SRC}" alt="${p.name} ${p.balance.toLocaleString()}p 만료기한 ${p.expiry}">
    </div>`;
    }

    return `${divider}
    <div class="pts-list-card" data-cat="${pointCat}" onclick="showPointsDetail('${p.id}')">
      <div class="pts-lc-logo" style="background:${logoBg}">${logoInner}</div>
      <div class="pts-lc-info">
        <div class="pts-lc-name-row">
          <span class="pts-lc-brand-sm">${p.name}</span>
          <button class="pts-lc-heart" type="button" onclick="event.stopPropagation()">${heartSvg}</button>
        </div>
        <div class="pts-lc-bal">${p.balance.toLocaleString()}<span class="pts-lc-unit">p</span></div>
        <div class="pts-lc-desc">만료기한 ${p.expiry}</div>
      </div>
    </div>`;
  });
  grid.innerHTML = items.join('');
}

/* ── 찜 페이지 렌더링 ── */
let _wshActiveCategory = '전체';

function getWshCategory(item) {
  const brand = String(item?.brand || item?.name || '').toLowerCase();
  const explicitCat = String(item?.cat || item?.category || '');
  if (explicitCat) return explicitCat;
  if (brand.includes('배민') || brand.includes('배달')) return '배달';
  if (brand.includes('올리브') || brand.includes('cj') || brand.includes('뷰티')) return '뷰티';
  if (brand.includes('이마트') || brand.includes('롯데마트') || brand.includes('홈플러스') || brand.includes('신세계') || brand.includes('h.point') || brand.includes('마트')) return '마트';
  if (brand.includes('스타벅스') || brand.includes('할리스') || brand.includes('공차') || brand.includes('카페') || brand.includes('해피')) return '카페';
  if (brand.includes('gs25') || brand.includes('gs앤') || brand.includes('l.point') || brand.includes('엘포인트') || brand.includes('cu') || brand.includes('세븐') || brand.includes('편의점')) return '편의점';
  return '기타';
}

function wshSelectCategory(cat, el) {
  _wshActiveCategory = cat || '전체';
  document.querySelectorAll('#p-wishlist .wsh-cat-chip').forEach(chip => {
    chip.classList.toggle('on', chip === el || (!el && chip.textContent.trim() === _wshActiveCategory));
  });
  const isPointActive = document.getElementById('wshTabPoints')?.classList.contains('on');
  const isBrandActive = document.getElementById('wshTabBrand')?.classList.contains('on');
  if (isPointActive) {
    wshRenderPoints();
  } else if (isBrandActive && typeof renderWishlistBrand === 'function') {
    renderWishlistBrand();
  } else {
    renderWishlist();
  }
}

function _wshHorizontalCouponCard(c) {
  const cond = c.cond === '없음' ? '조건 없음' : c.cond;
  const chLabel = cpnChannelBadge(c.channel);
  const logoSrc = BRAND_LOGO[c.brand];
  
  const logoInner = logoSrc
    ? `<img src="${logoSrc}" alt="${c.brand}" style="width:100%; height:100%; object-fit:contain; border-radius:var(--radius-full);">`
    : cpnInitial(c.brand);
  const logoBg = logoSrc ? 'white' : cpnBgColor(c.brand);
  const logoStyle = `background:${logoBg};${logoSrc ? '' : 'color:white;'}display:flex;align-items:center;justify-content:center;font-weight:var(--font-weight-heavy);overflow:hidden;`;
  
  const heartSvg = `<svg width="16" height="17" viewBox="0 0 24 24" fill="var(--color-red-400)" stroke="var(--color-red-400)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

  return `<div class="wsh-cpn-card wsh-normal-horizontal" data-action="go-detail" data-id="${c.id}" onclick="ACT['go-detail']&&ACT['go-detail']({target:this})">
    
    <div class="wsh-nh-header">
      <div class="wsh-nh-brand">${c.brand}</div>
      <span class="wsh-cpn-heart" onclick="event.stopPropagation();toggleCpnFav('${c.id}',this)">${heartSvg}</span>
    </div>
    
    <div class="wsh-nh-body">
      <div class="wsh-cpn-logo-wrap">
        <div class="wsh-cpn-logo-circle" style="${logoStyle}">${logoInner}</div>
        <span class="wsh-cpn-badge">${chLabel}</span>
      </div>
      
      <div class="wsh-nh-info">
        <div class="wsh-nh-title">${c.name}</div>
        <div class="wsh-nh-cond">${cond}</div>
        <div class="wsh-nh-date">${c.expiry} 까지</div>
      </div>
    </div>
  </div>`;
}

function _wshDdayTicketCard(c) {
  const dnum = cpnDdayNum(c.expiry);
  if (dnum >= 4) {
    return _wshHorizontalCouponCard(c);
  }
  
  const ddayLabel = dnum <= 0 ? 'D-DAY' : 'D-' + dnum;
  const badgeClass = dnum <= 0 ? 'filled' : 'outlined';
  const chLabel = cpnChannelBadge(c.channel);
  const cond = c.cond === '없음' ? '조건 없음' : c.cond;
  const logoSrc = BRAND_LOGO[c.brand];
  const logoInner = logoSrc
    ? `<img src="${logoSrc}" alt="${c.brand}" style="width:100%; height:100%; object-fit:contain; border-radius:var(--radius-full);">`
    : cpnInitial(c.brand);
  const logoBg = logoSrc ? 'white' : cpnBgColor(c.brand);
  const logoStyle = `background:${logoBg};color:white;display:flex;align-items:center;justify-content:center;font-weight:var(--font-weight-heavy);overflow:hidden;`;
  const heartSvg = `<svg width="16" height="17" viewBox="0 0 24 24" fill="var(--color-red-400)" stroke="var(--color-red-400)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

  return `<div class="wsh-cpn-card wsh-dday-ticket" data-action="go-detail" data-id="${c.id}" onclick="ACT['go-detail']&&ACT['go-detail']({target:this})">
    <div class="wsh-dday-inner">
      <div class="wsh-dday-content">
        <div class="wsh-dday-head">
          <span class="wsh-cpn-brand-lbl">${c.brand}</span>
          <span class="wsh-cpn-heart" onclick="event.stopPropagation();toggleCpnFav('${c.id}',this)">${heartSvg}</span>
        </div>
        <div class="wsh-dday-body">
          <div class="wsh-cpn-logo-wrap">
            <div class="wsh-cpn-logo-circle" style="${logoStyle}">${logoInner}</div>
            <span class="wsh-cpn-badge">${chLabel}</span>
          </div>
          <div class="wsh-cpn-info">
            <p class="wsh-cpn-title">${c.name}</p>
            <p class="wsh-cpn-cond">${cond}</p>
            <p class="wsh-cpn-date">${c.expiry} 까지</p>
          </div>
        </div>
      </div>
    </div>
    <div class="wsh-dday-badge ${badgeClass}">${ddayLabel}</div>
  </div>`;
}

function renderWishlist() {
  const list = document.getElementById('wshCpnList');
  if (!list) return;
  let faved = cpnFaved();
  
  if (_wshActiveCategory && _wshActiveCategory !== '전체') {
    faved = faved.filter(c => getWshCategory(c) === _wshActiveCategory);
  }
  
  // 정렬 옵션 반영
  const sortVal = document.getElementById('wshCpnSortLabel')?.textContent?.trim() || '마감임박순';
  if (sortVal === '마감임박순') {
    faved.sort((a, b) => cpnDdayNum(a.expiry) - cpnDdayNum(b.expiry));
  } else if (sortVal === '최대할인순') {
    faved.sort((a, b) => b.benefit - a.benefit);
  } else if (sortVal === '인기순') {
    faved.sort((a, b) => a.id.localeCompare(b.id));
  } else if (sortVal === '이름순') {
    faved.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  } else if (sortVal === '거리순') {
    faved.sort((a, b) => a.brand.localeCompare(b.brand, 'ko'));
  }
  
  if (!faved.length) {
    list.innerHTML = '<div style="padding:48px 20px;text-align:center;color:var(--color-gray-400)">찜한 쿠폰이 없습니다</div>';
    return;
  }
  list.innerHTML = faved.map(c => _wshDdayTicketCard(c)).join('');
  if (typeof injectBrandLogos === 'function') injectBrandLogos();
}

/* ── 알림 페이지 렌더링 ── */
function _npTicketCard(c, dnum) {
  const ddayLabel = dnum <= 0 ? 'D-DAY' : 'D-' + dnum;
  const badgeClass = dnum <= 0 ? 'filled' : 'outlined';
  const chLabel = c.channel || '온라인';
  const logoStyle = `background:${cpnBgColor(c.brand)};color:white`;
  const heartSvg = `<svg width="16" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  return `<div class="np-ticket-card" data-action="go-detail" data-id="${c.id}" onclick="ACT['go-detail']&&ACT['go-detail']({target:this})">
    <div class="np-ticket-inner">
      <div class="np-ticket-content">
        <div class="np-ticket-head">
          <span class="np-ticket-brand-lbl">${c.brand}</span>
          <button class="np-ticket-heart" onclick="event.stopPropagation()">${heartSvg}</button>
        </div>
        <div class="np-ticket-body">
          <div class="np-ticket-logo-wrap">
            <div class="np-ticket-logo" style="${logoStyle}">${cpnInitial(c.brand)}</div>
            <span class="np-ticket-ch-badge">${chLabel}</span>
          </div>
          <div class="np-ticket-info">
            <p class="np-ticket-title">${c.name}</p>
            <p class="np-ticket-cond">${c.cond || ''}</p>
            <p class="np-ticket-date">${c.expiry} 까지</p>
          </div>
        </div>
      </div>
    </div>
    <div class="np-dday-badge ${badgeClass}">${ddayLabel}</div>
  </div>`;
}

function _npH2Card(c) {
  const chLabel = c.channel || '온라인';
  const logoStyle = `background:${cpnBgColor(c.brand)};color:white`;
  const heartSvg = `<svg width="16" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  return `<div class="np-h2-card" data-action="go-detail" data-id="${c.id}" onclick="ACT['go-detail']&&ACT['go-detail']({target:this})">
    <div class="np-h2-head">
      <span class="np-h2-brand">${c.brand}</span>
      <button class="np-h2-heart" onclick="event.stopPropagation()">${heartSvg}</button>
    </div>
    <div class="np-h2-body">
      <div class="np-h2-logo-wrap">
        <div class="np-h2-logo" style="${logoStyle}">${cpnInitial(c.brand)}</div>
        <span class="np-h2-ch-badge">${chLabel}</span>
      </div>
      <div class="np-h2-info">
        <p class="np-h2-title">${c.name}</p>
        <p class="np-h2-cond">${c.cond || ''}</p>
        <p class="np-h2-date">${c.expiry} 까지</p>
      </div>
    </div>
  </div>`;
}

function renderNotifications() {
  const list = document.getElementById('notiAlertList');
  if (!list) return;
  const soon = cpnExpiringSoon(30);
  if (!soon.length) { list.innerHTML = '<div style="padding:var(--spacing-32);text-align:center;color:var(--color-gray-300);font-family:var(--font);font-size:var(--font-size-caption)">마감 임박 쿠폰이 없습니다</div>'; return; }

  // D-day별 그룹핑
  const groups = {};
  soon.forEach(c => {
    const d = cpnDdayNum(c.expiry);
    const key = d <= 0 ? 0 : d;
    if (!groups[key]) groups[key] = [];
    groups[key].push({ c, d: key });
  });

  const sortedKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);
  list.innerHTML = sortedKeys.map(key => {
    const items = groups[key];
    const isUrgent = key <= 1;
    const labelClass = isUrgent ? 'urgent' : 'normal';
    const ddayText = key <= 0 ? 'D-DAY' : 'D-' + key;
    const cardsHtml = items.map(({ c }) =>
      isUrgent ? _npTicketCard(c, key) : _npH2Card(c)
    ).join('');
    return `<div class="np-dday-group">
      <div class="np-dday-header">
        <span class="np-dday-label ${labelClass}">${ddayText}</span>
        <div class="np-dday-line"></div>
      </div>
      ${cardsHtml}
    </div>`;
  }).join('');
}

/* ── 페이지 진입 시 렌더링 훅 ── */
document.addEventListener('DOMContentLoaded', function() {
  renderHomeCarousel();
  renderHomeList();
  renderHomeStats();
  renderWishlist();
  renderNotifications();
  renderPhCpnList();
  renderPhPtsList();
  initRepBrcSelect();
});

function hm2ChipSelect(el) {
  document.querySelectorAll('.hm2-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}
(function() {
  function initHm2Carousel() {
    const carousel = document.getElementById('hm2Carousel');
    const dots = document.querySelectorAll('#hm2Dots .hm2-dot');
    if (!carousel || !dots.length) return;
    carousel.addEventListener('scroll', function() {
      const idx = Math.round(carousel.scrollLeft / 159);
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }, { passive: true });
  }
  document.addEventListener('DOMContentLoaded', initHm2Carousel);
})();
function openDetFromHome(id) {
  if (ACT['go-detail']) ACT['go-detail']({ target: { dataset: { id } } });
}

/* ── 기간 드롭다운 ── */
function mfTogglePeriod() {
  const btn = document.getElementById('mfPeriodBtn');
  const dd  = document.getElementById('mfPeriodDropdown');
  if (!btn || !dd) return;
  const isOpen = dd.classList.contains('open');
  if (isOpen) {
    dd.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    dd.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}
function mfSelectPeriod(label, el) {
  document.getElementById('mfPeriodLabel').textContent = label;
  // selected 클래스 이동
  const opts = document.querySelectorAll('.mf-period-opt');
  opts.forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  // 드롭다운 닫기
  document.getElementById('mfPeriodDropdown').classList.remove('open');
  document.getElementById('mfPeriodBtn').classList.remove('open');
  document.getElementById('mfPeriodBtn').setAttribute('aria-expanded', 'false');
}
// 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('mfPeriodWrap');
  if (wrap && !wrap.contains(e.target)) {
    const dd  = document.getElementById('mfPeriodDropdown');
    const btn = document.getElementById('mfPeriodBtn');
    if (dd)  dd.classList.remove('open');
    if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
  }
});

/* ── 혜택 사용 현황 차트 인터렉션 ── */
(function() {
  function initMfChart() {
    const area = document.getElementById('mfChartArea');
    if (!area) return;
    const dots = area.querySelectorAll('.mf-dot');
    const tip  = document.getElementById('mfChartTip');
    const lbl  = document.getElementById('mfTipLabel');
    const val  = document.getElementById('mfTipVal');
    if (!dots.length || !tip) return;

    function activate(dot) {
      // 모든 dot 초기화
      dots.forEach(d => {
        d.removeAttribute('data-active');
        d.setAttribute('r', d._baseR || '4');
      });
      // 선택 dot 확대
      if (!dot._baseR) dot._baseR = dot.getAttribute('r');
      dot.setAttribute('data-active', 'true');
      dot.setAttribute('r', '7');

      // tooltip 위치 (SVG viewBox 0~346 → 실제 컨테이너 너비 비율)
      const pct = parseFloat(dot.dataset.pct) / 100;
      const areaW = area.offsetWidth;
      let leftPx = pct * areaW;
      // 화면 밖 clamp
      leftPx = Math.max(40, Math.min(leftPx, areaW - 40));
      tip.style.left = leftPx + 'px';

      // tooltip 내용
      lbl.textContent = dot.dataset.label;
      val.textContent = dot.dataset.val;
    }

    // 초기 활성 dot
    const initDot = area.querySelector('.mf-dot[data-active="true"]');
    if (initDot) activate(initDot);

    dots.forEach(dot => {
      dot.addEventListener('click', () => activate(dot));
      dot.addEventListener('touchstart', e => { e.preventDefault(); activate(dot); }, { passive: false });
    });
  }

  // DOM 준비 후 실행 + mypage 진입 시에도 재초기화
  document.addEventListener('DOMContentLoaded', initMfChart);
  document.addEventListener('appPageShown', function(e) {
    if (e.detail === 'p-mypage') setTimeout(initMfChart, 80);
  });
})();

/* ── 공유 바텀시트 ── */
function openDetShare() {
  const overlay = document.getElementById('detShareOverlay');
  if (overlay) { overlay.classList.add('open'); _lockAllScroll(); }
}
function closeDetShare(e) {
  if (!e || e.target === e.currentTarget) {
    const overlay = document.getElementById('detShareOverlay');
    if (overlay) { overlay.classList.remove('open'); _unlockAllScroll(); }
  }
}

/* ── 결제 가능 바코드 모달 ── */
function openDetBrcModal() {
  const overlay = document.getElementById('detBrcModalOverlay');
  if (!overlay) return;

  // 상세페이지의 브랜드명·타이틀을 모달에 동기화
  const brand = document.getElementById('detBrandName');
  const title = document.getElementById('detCpnTitle');
  const num   = document.getElementById('detBrcNum');
  if (brand) document.getElementById('detBrcModalBrand').textContent = brand.textContent;
  if (title) document.getElementById('detBrcModalTitle').textContent = title.textContent;
  if (num)   document.getElementById('detBrcModalNum').textContent   = num.textContent;

  // 바코드 SVG 복사
  const srcSvg  = document.getElementById('detBrcSvg');
  const destSvg = document.getElementById('detBrcModalSvg');
  if (srcSvg && destSvg) destSvg.innerHTML = srcSvg.innerHTML;

  overlay.classList.add('open');
  _lockAllScroll();   /* 전체 스크롤 잠금 */
}
function closeDetBrcModal(e) {
  if (!e || e.target === e.currentTarget) {
    const overlay = document.getElementById('detBrcModalOverlay');
    if (overlay) { overlay.classList.remove('open'); _unlockAllScroll(); }
  }
}

function showBrcPopup() {
  const popup = document.getElementById('brcInstantPopup'); if (!popup) return;
  // 팝업 SVG 그리기
  const svg = document.getElementById('brcPopupSvg');
  if (svg && !svg.children.length) {
    const pat=[1,0,1,1,0,1,0,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0,0,1,0,1,1,0,1,0,1];
    const W=300, bw=W/pat.length;
    pat.forEach((on,i)=>{ if(!on)return; const r=document.createElementNS('http://www.w3.org/2000/svg','rect'); r.setAttribute('x',i*bw);r.setAttribute('y',0);r.setAttribute('width',bw*.72);r.setAttribute('height',100);r.setAttribute('fill','#111');svg.appendChild(r); });
  }
  popup.classList.add('show');
  // 화면 밝기 최대화 시뮬레이션 (실제 기기에서는 Screen Brightness API 사용)
  document.documentElement.style.filter = 'brightness(1.08)';
}
function closeBrcPopup() {
  const popup = document.getElementById('brcInstantPopup'); if (!popup) return;
  popup.classList.remove('show');
  document.documentElement.style.filter = '';
}

function drawBarcodeRects(svg, pattern, width, height) {
  if (!svg || !Array.isArray(pattern) || !pattern.length) return;
  svg.innerHTML = '';
  const bw = width / pattern.length;
  pattern.forEach((on, i) => {
    if (!on) return;
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('x', i * bw);
    r.setAttribute('y', 0);
    r.setAttribute('width', bw * .72);
    r.setAttribute('height', height);
    r.setAttribute('fill', '#111111');
    svg.appendChild(r);
  });
}

const REP_BRC_POINT_TEXT = {
  kt: '3,200p',
  lgu: '3,000p',
  skt: '3,000p',
  happy: '3,000p',
  gs25: '3,200p',
  cu: '5,500p',
  emart: '10,200p'
};

function formatRepBrcPopupNum(num) {
  return (num || '').replaceAll('-', '   ');
}


/* ============================================================ NEARBY SEARCH ============================================================ */
function filterNearby() {
  const kw = document.getElementById('nearbySearch').value.toLowerCase().trim();
  document.querySelectorAll('#nearbyList .nearby-item').forEach(item => {
    const name = item.querySelector('.nearby-name').textContent.toLowerCase();
    const addr = item.querySelector('.nearby-addr').textContent.toLowerCase();
    item.style.display = (!kw || name.includes(kw) || addr.includes(kw)) ? '' : 'none';
  });
}

/* ============================================================ DISCOUNT SLIDER ============================================================ */
/* ── 할인율 원형 다이얼 ── */
const _DA = { r:75, cx:100, cy:100, start:135, sweep:270 };

function _daPoint(deg) {
  const rad = deg * Math.PI / 180;
  return [_DA.cx + _DA.r * Math.cos(rad), _DA.cy + _DA.r * Math.sin(rad)];
}

function updateDiscArc(v) {
  v = Math.max(0, Math.min(100, Math.round(v / 5) * 5));
  const [sx, sy] = _daPoint(_DA.start);
  const endDeg = _DA.start + _DA.sweep * v / 100;
  const [ex, ey] = _daPoint(endDeg);
  const fill = document.getElementById('discArcFill');
  const handle = document.getElementById('discArcHandle');
  const valEl = document.getElementById('discVal');
  if (valEl) valEl.textContent = v;
  if (handle) { handle.setAttribute('cx', ex.toFixed(2)); handle.setAttribute('cy', ey.toFixed(2)); }
  if (fill) {
    if (v === 0) { fill.setAttribute('d', ''); }
    else {
      const large = (_DA.sweep * v / 100 > 180) ? 1 : 0;
      fill.setAttribute('d', `M ${sx.toFixed(2)},${sy.toFixed(2)} A ${_DA.r},${_DA.r} 0 ${large},1 ${ex.toFixed(2)},${ey.toFixed(2)}`);
    }
  }
}

let _daInited = false;
function initDiscArc() {
  const svg = document.getElementById('discArcSvg');
  if (!svg) return;
  updateDiscArc(30);
  if (_daInited) return;
  _daInited = true;
  let _daDrag = false;

  function _daGetVal(e) {
    const rect = svg.getBoundingClientRect();
    const px = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const py = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    let angle = Math.atan2(py - (rect.top + rect.height/2), px - (rect.left + rect.width/2)) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    let rel = angle - _DA.start;
    if (rel < 0) rel += 360;
    if (rel > _DA.sweep) rel = (rel < _DA.sweep + (360 - _DA.sweep)/2) ? _DA.sweep : 0;
    return Math.round(rel / _DA.sweep * 100 / 5) * 5;
  }

  svg.addEventListener('pointerdown', e => {
    _daDrag = true;
    svg.setPointerCapture(e.pointerId);
    updateDiscArc(_daGetVal(e));
    e.preventDefault();
  });
  svg.addEventListener('pointermove', e => { if (_daDrag) updateDiscArc(_daGetVal(e)); });
  ['pointerup','pointercancel'].forEach(ev => svg.addEventListener(ev, () => _daDrag = false));
}

function updateDiscSlider(input) { /* 하위 호환 유지 — 미사용 */ }

function toggleNotiOnbAll(cb) {
  document.querySelectorAll('#s-notification .noti-onb-row .toggle-wrap input[type=checkbox]')
    .forEach(t => { t.checked = cb.checked; });
}
function setNotiMethodAll(v) { window._notiMethod = v; }
function toggleNotiAll(btn) {
  const on = btn.dataset.on !== '1';
  btn.dataset.on = on ? '1' : '';
  btn.style.background = on ? 'var(--primary)' : 'var(--gray-200)';
  btn.style.color = on ? 'white' : 'var(--gray-500)';
  document.querySelectorAll('#s-notification .noti-onb-row .toggle-wrap input[type=checkbox]')
    .forEach(t => { t.checked = on; });
}
function toggleFav(btn, e) {
  e.stopPropagation();
  const on = btn.classList.toggle('active');
  btn.textContent = on ? '♥' : '♡';
  if (on) {
    btn.style.animation = 'none';
    btn.offsetWidth;
    btn.style.animation = 'favPop .3s ease forwards';
  } else {
    btn.style.animation = 'none';
    btn.style.transform = '';
  }
}

/* ── 알림설정 브랜드 검색 ── */
const BRAND_NOTI_LIST = [
  '이마트','홈플러스','롯데마트','GS25','CU','세븐일레븐','이마트24',
  '스타벅스','이디야','메가커피','컴포즈커피','투썸플레이스','할리스',
  '배달의민족','쿠팡이츠','요기요','올리브영','다이소','무신사',
  '쿠팡','11번가','G마켓','옥션','네이버쇼핑','CGV','롯데시네마','메가박스',
  '파리바게뜨','뚜레쥬르','맥도날드','버거킹','롯데리아','KFC','서브웨이'
];
let brandNotiSelected = new Set();

function initBrandNoti() {
  const grid = document.getElementById('brandNotiGrid');
  if (!grid || grid.children.length > 0) return;
  renderBrandNotiChips(BRAND_NOTI_LIST);
}

function renderBrandNotiChips(list) {
  const grid = document.getElementById('brandNotiGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (list.length === 0) {
    grid.innerHTML = '<div style="font-size:14px;color:var(--gray-400);padding:8px 0">검색 결과가 없습니다</div>';
    return;
  }
  list.forEach(name => {
    const chip = document.createElement('div');
    chip.className = 'brand-chip' + (brandNotiSelected.has(name) ? ' sel' : '');
    chip.textContent = name;
    chip.style.cursor = 'pointer';
    chip.onclick = () => {
      chip.classList.toggle('sel');
      if (chip.classList.contains('sel')) brandNotiSelected.add(name);
      else brandNotiSelected.delete(name);
      updateBrandNotiSummary();
    };
    grid.appendChild(chip);
  });
}

function filterBrandNoti(kw) {
  const q = kw.trim().toLowerCase();
  const filtered = q ? BRAND_NOTI_LIST.filter(b => b.toLowerCase().includes(q)) : BRAND_NOTI_LIST;
  renderBrandNotiChips(filtered);
}

function clearBrandNoti() {
  brandNotiSelected.clear();
  const kw = document.getElementById('brandNotiSearch');
  filterBrandNoti(kw ? kw.value : '');
  updateBrandNotiSummary();
}

function updateBrandNotiSummary() {
  const el = document.getElementById('brandNotiSummary');
  if (!el) return;
  if (brandNotiSelected.size === 0) {
    el.textContent = '선택된 브랜드 없음 — 모든 브랜드에 카테고리 설정이 적용돼요';
  } else {
    const names = [...brandNotiSelected].join(', ');
    el.textContent = `${brandNotiSelected.size}개 선택됨 — ${names}`;
  }
}

/* ============================================================ NOTI SETTINGS — 카테고리·브랜드 선택 ============================================================ */
const NOTI_BRANDS = {
  mart:     [
    {label:'이마트'},    {label:'GS25'},    {label:'CU'},
    {label:'롯데마트'},  {label:'홈플러스'}, {label:'세븐일레븐'}
  ],
  delivery: [
    {label:'배달의민족'}, {label:'요기요'}, {label:'쿠팡이츠'}
  ],
  fashion:  [
    {label:'올리브영'}, {label:'무신사'}, {label:'H&M'}, {label:'자라'}
  ],
  culture:  [
    {label:'CGV'}, {label:'롯데시네마'}, {label:'메가박스'}
  ],
  fnb:      [
    {label:'스타벅스'}, {label:'맥도날드'}, {label:'버거킹'}, {label:'투썸플레이스'}
  ],
  travel:   [
    {label:'야놀자'}, {label:'여기어때'}
  ],
  etc:      [
    {label:'쿠팡'}, {label:'티몬'}, {label:'위메프'}
  ]
};
const notiSelBrands = new Set();
const NOTI_BRAND_VIEW = {
  mart: [
    {label:'이마트', logo:'emart'}, {label:'올리브영', logo:'OLIVE<br>YOUNG'}, {label:'스타벅스', logo:'STAR<br>BUCKS'},
    {label:'배달의민족', logo:'배달의민족'}, {label:'쿠팡', logo:'coupang'}, {label:'요기요', logo:'요기요'},
    {label:'GS25', logo:'GS25'}, {label:'브랜드 추가', logo:'+', add:true}
  ],
  delivery: [
    {label:'배달의민족', logo:'배달의민족'}, {label:'쿠팡이츠', logo:'coupang'}, {label:'요기요', logo:'요기요'}, {label:'브랜드 추가', logo:'+', add:true}
  ],
  fashion: [
    {label:'올리브영', logo:'OLIVE<br>YOUNG'}, {label:'무신사', logo:'MUSINSA'}, {label:'H&M', logo:'H&M'}, {label:'브랜드 추가', logo:'+', add:true}
  ],
  culture: [
    {label:'이마트', logo:'emart'}, {label:'롯데마트', logo:'LOTTE'}, {label:'홈플러스', logo:'HOME<br>PLUS'}, {label:'브랜드 추가', logo:'+', add:true}
  ],
  fnb: [
    {label:'스타벅스', logo:'STAR<br>BUCKS'}, {label:'맥도날드', logo:'McD'}, {label:'투썸플레이스', logo:'A<br>TWOSOME'}, {label:'브랜드 추가', logo:'+', add:true}
  ],
  travel: [
    {label:'야놀자', logo:'yanolja'}, {label:'여기어때', logo:'여기<br>어때'}, {label:'브랜드 추가', logo:'+', add:true}
  ],
  etc: [
    {label:'GS25', logo:'GS25'}, {label:'CU', logo:'CU'}, {label:'세븐일레븐', logo:'7<br>ELEVEN'}, {label:'브랜드 추가', logo:'+', add:true}
  ]
};
const notiBrandMethods = {}; // label → '앱 알림' | '문자(SMS)' | '앱 + 문자'

function selectNotiCat(cat) {
  document.querySelectorAll('.noti-cat-chip').forEach(c => c.classList.toggle('sel', c.dataset.cat === cat));
  const row = document.getElementById('notiBrandRow');
  if (!row) return;
  const brands = NOTI_BRAND_VIEW[cat] || NOTI_BRANDS[cat] || [];
  row.innerHTML = brands.map(b => `
    <div class="noti-brand-chip${b.add ? ' add' : ''}${notiSelBrands.has(b.label) ? ' sel' : ''}" data-label="${b.label}" onclick="${b.add ? '' : `toggleNotiBrand(this,'${b.label.replace(/'/g,"\\'")}')`}">
      <span>${b.logo || b.label}</span>
    </div>`).join('');
}

function toggleNotiBrand(el, label) {
  if (notiSelBrands.has(label)) {
    notiSelBrands.delete(label);
    el.classList.remove('sel');
    delete notiBrandMethods[label];
  } else {
    notiSelBrands.add(label);
    el.classList.add('sel');
    notiBrandMethods[label] = '앱 알림';
  }
  renderNotiBrandMethods();
}

function renderNotiBrandMethods() {
  const panel = document.getElementById('notiBrandMethods');
  if (!panel) return;
  if (notiSelBrands.size === 0) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  panel.innerHTML = [...notiSelBrands].map(label => `
    <div class="noti-brand-method-row">
      <span style="flex:1;font-size:14px;font-weight:700;color:var(--gray-900)">${label}</span>
      <select class="noti-brand-method-sel" onchange="notiBrandMethods['${label.replace(/'/g,"\\'")}'] = this.value">
        <option ${notiBrandMethods[label]==='앱 알림'   ?'selected':''}>앱 알림</option>
        <option ${notiBrandMethods[label]==='문자(SMS)'?'selected':''}>문자(SMS)</option>
        <option ${notiBrandMethods[label]==='앱 + 문자'?'selected':''}>앱 + 문자</option>
      </select>
    </div>`).join('');
}

/* 할인율 스크롤 피커 */
let _notiDiscVal = 30;
let _notiDiscOpen = false;

function toggleNotiDiscPicker() {
  const picker = document.getElementById('notiDiscPicker');
  if (!picker) return;
  _notiDiscOpen = !_notiDiscOpen;
  if (_notiDiscOpen) {
    // 처음 열 때 피커 아이템 생성
    if (!picker.children.length) {
      for (let v = 0; v <= 100; v += 5) {
        const div = document.createElement('div');
        div.className = 'noti-disc-item' + (v === _notiDiscVal ? ' sel' : '');
        div.dataset.val = v;
        div.textContent = v + '%';
        div.onclick = () => selectNotiDisc(v);
        picker.appendChild(div);
      }
    }
    picker.style.display = 'block';
    // 선택 항목으로 스크롤
    const sel = picker.querySelector('.noti-disc-item.sel');
    if (sel) setTimeout(() => sel.scrollIntoView({ block: 'center' }), 30);
  } else {
    picker.style.display = 'none';
  }
}

function selectNotiDisc(val) {
  _notiDiscVal = val;
  const valEl = document.getElementById('notiDiscVal');
  if (valEl) valEl.textContent = val;
  document.querySelectorAll('.noti-disc-item').forEach(el =>
    el.classList.toggle('sel', parseInt(el.dataset.val) === val));
  // 닫기
  setTimeout(() => {
    const picker = document.getElementById('notiDiscPicker');
    if (picker) picker.style.display = 'none';
    _notiDiscOpen = false;
  }, 160);
}

/* ============================================================ CAROUSEL — 10초 무한 마퀴 ============================================================ */
function initCarousel() {
  const track = document.getElementById('carouselTrack'); if (!track) return;
  // 기존 클론 제거 후 재생성
  track.querySelectorAll('.carousel-clone').forEach(c => c.remove());
  const origSlides = [...track.querySelectorAll('.carousel-slide')];
  origSlides.forEach(s => {
    const clone = s.cloneNode(true);
    clone.classList.add('carousel-clone');
    clone.removeAttribute('data-action');
    track.appendChild(clone);
  });
  // 점 네비게이션
  const dotsEl = document.getElementById('cDots');
  if (dotsEl) {
    dotsEl.innerHTML = '';
    origSlides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'c-dot' + (i === 0 ? ' on' : '');
      d.onclick = () => goCar(i);
      dotsEl.appendChild(d);
    });
  }
  // CSS 무한 애니메이션 시작
  track.style.animation = 'none';
  track.offsetHeight; // reflow
  requestAnimationFrame(() => {
    const sw = (origSlides[0]?.offsetWidth || 280) + 20;
    track.style.setProperty('--car-dist', `-${sw * origSlides.length}px`);
    track.style.animation = 'carMarquee 10s linear infinite';
  });
  // 호버 일시정지
  const wrap = track.closest('.carousel-wrap');
  if (wrap) {
    wrap.onmouseenter = () => track.style.animationPlayState = 'paused';
    wrap.onmouseleave = () => track.style.animationPlayState = 'running';
  }
  // 점 업데이트
  if (S.carTimer) clearInterval(S.carTimer);
  const n = origSlides.length;
  S.carTimer = setInterval(() => {
    const frac = ((Date.now() % 10000) / 10000);
    const idx = Math.floor(frac * n) % n;
    document.querySelectorAll('.c-dot').forEach((d, j) => d.classList.toggle('on', j === idx));
    S.carIdx = idx;
  }, 500);
}
function goCar(i) {
  const track = document.getElementById('carouselTrack'); if (!track) return;
  const origSlides = [...track.querySelectorAll('.carousel-slide:not(.carousel-clone)')];
  const n = origSlides.length;
  S.carIdx = ((i % n) + n) % n;
  // 클릭한 슬라이드부터 다시 시작
  const sw = (origSlides[0]?.offsetWidth || 280) + 20;
  track.style.animation = 'none';
  track.style.transform = `translateX(-${S.carIdx * sw}px)`;
  track.offsetHeight;
  requestAnimationFrame(() => {
    const remaining = ((n - S.carIdx) / n) * 10;
    const fullDist = sw * n;
    track.style.setProperty('--car-dist', `-${fullDist - S.carIdx * sw}px`);
    track.style.animation = `carMarquee ${remaining}s linear 1, carMarquee 10s linear ${remaining}s infinite`;
  });
  document.querySelectorAll('.c-dot').forEach((d, j) => d.classList.toggle('on', j === S.carIdx));
}
function moveCar(dir) { goCar(S.carIdx + dir); }

/* ============================================================ WALLET FILTER ============================================================ */
function wltSearch(q) {
  const grid = document.getElementById('walletGrid'); if (!grid) return;
  const kw = q.trim().toLowerCase();
  grid.querySelectorAll('.cpn-card').forEach(c => {
    if (!kw) { c.style.display = ''; return; }
    const brand = (c.querySelector('.cpn-brand')?.textContent || '').toLowerCase();
    const title = (c.querySelector('.cpn-title')?.textContent || '').toLowerCase();
    c.style.display = (brand.includes(kw) || title.includes(kw)) ? '' : 'none';
  });
}

function applyWalletFilter(cat, sort) {
  const grid=document.getElementById('walletGrid'); if(!grid)return;
  const cards=[...grid.querySelectorAll('.cpn-card')];
  cards.forEach(c=>{
    const show=cat==='all'||c.dataset.cat===cat;
    c.style.display=show?'':'none';
  });
  const visible=cards.filter(c=>c.style.display!=='none');
  if (sort==='discount') visible.sort((a,b)=>parseInt(b.dataset.disc||0)-parseInt(a.dataset.disc||0));
  else if (sort==='expire') visible.sort((a,b)=>parseInt(a.dataset.exp||999)-parseInt(b.dataset.exp||999));
  else if (sort==='downloaded') visible.sort((a,b)=>(downloaded.has(b.dataset.id)?1:0)-(downloaded.has(a.dataset.id)?1:0));
  else if (sort==='distance') { /* GPS 기반 — mock: 랜덤 순서 */ }
  else if (sort==='popular') visible.sort((a,b)=>parseInt(b.dataset.disc||0)-parseInt(a.dataset.disc||0));
  visible.forEach(c=>grid.appendChild(c));
}

let wCat='all', wSort='expire', wTab='downloaded';
function applyWalletTab(statusKey) {
  wTab = statusKey;
  const grid = document.getElementById('walletGrid'); if (!grid) return;
  grid.querySelectorAll('.cpn-card').forEach(c => {
    const s   = c.dataset.status || 'available';
    const exp = parseInt(c.dataset.exp ?? 999);
    const catOk = wCat === 'all' || c.dataset.cat === wCat;
    let tabOk;
    if (statusKey === 'all')             tabOk = s !== 'used';
    else if (statusKey === 'available')  tabOk = (s === 'available' || s === 'condition') && exp > 5;
    else if (statusKey === 'expire')     tabOk = exp <= 5 && s !== 'used';
    else if (statusKey === 'downloaded') tabOk = s === 'downloaded';
    else if (statusKey === 'popular')    tabOk = s !== 'used';
    else tabOk = true;
    c.style.display = (catOk && tabOk) ? '' : 'none';
  });
  // 인기순 탭: 할인율 높은 순 정렬
  if (statusKey === 'popular') {
    const grid2 = document.getElementById('walletGrid');
    const vis = [...grid2.querySelectorAll('.cpn-card')].filter(c=>c.style.display!=='none');
    vis.sort((a,b)=>parseInt(b.dataset.disc||0)-parseInt(a.dataset.disc||0));
    vis.forEach(c=>grid2.appendChild(c));
  }
}

/* ============================================================ OTP ============================================================ */
let timerID=null;
function startOTPTimer() {
  let s=59;
  const el = document.getElementById('otpTimer');
  const btn = document.querySelector('.otp-resend-btn');
  clearInterval(timerID);
  if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; }
  timerID = setInterval(()=>{
    s--;
    if (el) el.textContent = `재발송 가능: ${s}초 후`;
    if (s <= 0) {
      clearInterval(timerID);
      if (el) el.textContent = '재전송 가능';
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    }
  }, 1000);
}
function checkOTP(inp) {
  if(inp.value.length===6) setTimeout(()=>{ /* OTP auto-check */ },500);
}
function fmtPhone(inp) {
  let v=inp.value.replace(/\D/g,'').slice(0,11);
  if(v.length>7) v=v.slice(0,3)+'-'+v.slice(3,7)+'-'+v.slice(7);
  else if(v.length>3) v=v.slice(0,3)+'-'+v.slice(3);
  inp.value=v;
}

function initBirthDropdowns() {
  const yEl = document.getElementById('birthY');
  const mEl = document.getElementById('birthM');
  const dEl = document.getElementById('birthD');
  if (!yEl || yEl.options.length > 1) return;
  const curY = new Date().getFullYear();
  for (let y = curY - 14; y >= 1924; y--) {
    const o = document.createElement('option');
    o.value = String(y);
    o.textContent = y + '년';
    yEl.appendChild(o);
  }
  for (let m = 1; m <= 12; m++) {
    const o = document.createElement('option');
    o.value = String(m).padStart(2,'0');
    o.textContent = m + '월';
    mEl.appendChild(o);
  }
  for (let d = 1; d <= 31; d++) {
    const o = document.createElement('option');
    o.value = String(d).padStart(2,'0');
    o.textContent = d + '일';
    dEl.appendChild(o);
  }
}

function showLoginTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tabLogin').classList.toggle('on', isLogin);
  document.getElementById('tabSignup').classList.toggle('on', !isLogin);
  document.getElementById('loginPanel').style.display  = isLogin ? '' : 'none';
  document.getElementById('signupPanel').style.display = isLogin ? 'none' : '';
}

function selectGender(g) {
  document.getElementById('genderM')?.classList.toggle('sel', g==='M');
  document.getElementById('genderF')?.classList.toggle('sel', g==='F');
}

function handleEmailDomain(sel) {
  const wrap = document.getElementById('emailCustomWrap');
  if (wrap) wrap.style.display = sel.value === 'custom' ? '' : 'none';
}

function fmtBirth(inp) {
  let v=inp.value.replace(/\D/g,'').slice(0,8);
  if(v.length>6) v=v.slice(0,4)+'.'+v.slice(4,6)+'.'+v.slice(6);
  else if(v.length>4) v=v.slice(0,4)+'.'+v.slice(4);
  inp.value=v;
}

function showNotiPopup() {
  const el = document.getElementById('notiPopup');
  if (el) el.style.display = 'flex';
}
function closeNotiPopup(choice) {
  const el = document.getElementById('notiPopup');
  if (el) el.style.display = 'none';
  if (choice === 'on') {
    showAppPage('mypage'); updateSidebar('mypage');
    setTimeout(()=>showMypageSub('noti'), 80);
  }
}

function filterSvcCards(kw) {
  const q = kw.toLowerCase().trim();
  document.querySelectorAll('#s-integration .svc-card').forEach(card => {
    const name = card.querySelector('.svc-name')?.textContent.toLowerCase() || '';
    card.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
}

function toggleAllSvc() {
  const cards = [...document.querySelectorAll('#s-integration .svc-card')];
  const btn = document.getElementById('svcAllBtn');
  const allDone = cards.every(c => c.classList.contains('connected'));
  cards.forEach(card => {
    const b = card.querySelector('.conn-btn');
    if (allDone) {
      card.classList.remove('connected');
      if (b) { b.classList.remove('done'); b.textContent = '연동하기'; }
    } else {
      card.classList.add('connected');
      if (b) { b.classList.add('done'); b.textContent = '✓ 완료'; }
    }
  });
  const nowAll = !allDone;
  if (btn) {
    btn.style.background = nowAll ? 'var(--primary)' : 'var(--gray-100)';
    btn.style.borderColor = nowAll ? 'var(--primary)' : 'var(--gray-300)';
    btn.style.color = nowAll ? 'white' : 'var(--gray-500)';
  }
}

function toggleBrandAll() {
  const chips = document.querySelectorAll('#brandGrid .brand-chip');
  const btn = document.getElementById('brandAllToggleBtn');
  const allSel = [...chips].every(c => c.classList.contains('sel'));
  if (allSel) {
    chips.forEach(c => c.classList.remove('sel'));
    if (btn) { btn.textContent='전체 선택'; btn.style.background='var(--gray-100)'; btn.style.borderColor='var(--gray-300)'; btn.style.color='var(--gray-500)'; }
  } else {
    chips.forEach(c => c.classList.add('sel'));
    if (btn) { btn.textContent='전체 해제'; btn.style.background='var(--primary)'; btn.style.borderColor='var(--primary)'; btn.style.color='white'; }
  }
}

function quickSelectCat(cat) {
  document.querySelectorAll(`#s-integration .svc-card[data-cat="${cat}"]`).forEach(card => {
    const btn = card.querySelector('.conn-btn');
    if (!card.classList.contains('connected')) {
      card.classList.add('connected');
      if (btn) { btn.classList.add('done'); btn.textContent = '✓ 완료'; }
    }
  });
}

function updatePwToggle(inp) {
  const btn = inp.closest('.field-wrap')?.querySelector('.pw-toggle');
  if (btn) btn.style.display = inp.value ? 'block' : 'none';
}

function siToggleClear(input) {
  const clearBtn = input.parentElement.querySelector('.si-clear');
  if (clearBtn) clearBtn.classList.toggle('visible', input.value.length > 0);
}
function siClear(inputId, btn) {
  const inp = document.getElementById(inputId); if (!inp) return;
  inp.value = '';
  inp.focus();
  btn.classList.remove('visible');
}
function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId); if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  if (btn && btn.classList && btn.classList.contains('si-eye')) {
    btn.classList.toggle('is-visible', show);
    btn.setAttribute('aria-label', show ? '비밀번호 숨기기' : '비밀번호 보기');
    btn.title = show ? '비밀번호 숨기기' : '비밀번호 표시';
    return;
  }
  btn.textContent = show ? '🙈' : '👁';
  btn.title = show ? '비밀번호 숨기기' : '비밀번호 표시';
}

/* 숫자 스피너 */
function changeSpinner(inputId, delta) {
  const inp = document.getElementById(inputId); if (!inp) return;
  let val = parseInt(inp.value) || 0;
  val += delta;

  if (inputId === 'birthY') {
    val = Math.max(1900, Math.min(2050, val));
    inp.value = String(val).padStart(4, '0');
  } else if (inputId === 'birthM') {
    val = Math.max(1, Math.min(12, val));
    inp.value = String(val).padStart(2, '0');
  } else if (inputId === 'birthD') {
    val = Math.max(1, Math.min(31, val));
    inp.value = String(val).padStart(2, '0');
  }
}

/* ============================================================ BRAND LOGOS ============================================================ */
const BRAND_LOGO_MAP = {
  '이마트':       { bg:'#FFEC00', color:'#d40000', letter:'E',  cat:'마트' },
  '배달의민족':   { bg:'#30D5C8', color:'#004c47', letter:'B',  cat:'배달' },
  '스타벅스':     { bg:'#00704A', color:'#fff',    letter:'★', cat:'카페' },
  'GS25':        { bg:'#0072c6', color:'#fff',    letter:'G',  cat:'편의점' },
  '쿠팡':        { bg:'#ff6000', color:'#fff',    letter:'쿠', cat:'쇼핑' },
  '올리브영':    { bg:'#00a550', color:'#fff',    letter:'O',  cat:'뷰티' },
  '롯데마트':    { bg:'#e60012', color:'#fff',    letter:'롯', cat:'마트' },
  '투썸플레이스': { bg:'#c8a16d', color:'#fff',   letter:'T',  cat:'카페' },
  '요기요':      { bg:'#ff1744', color:'#fff',    letter:'요', cat:'배달' },
  'KT':          { bg:'#1a56db', color:'#fff',    letter:'K',  cat:'통신사' },
  'SKT':         { bg:'#e51400', color:'#fff',    letter:'S',  cat:'통신사' },
  'CU':          { bg:'#7b2d8b', color:'#fff',    letter:'C',  cat:'편의점' },
  '쿠팡이츠':    { bg:'#ff6000', color:'#fff',    letter:'쿠', cat:'배달' },
  '카카오':      { bg:'#FEE500', color:'#3a1d00', letter:'K',  cat:'플랫폼' },
  '네이버':      { bg:'#03C75A', color:'#fff',    letter:'N',  cat:'플랫폼' },
  '홈플러스':    { bg:'#006633', color:'#fff',    letter:'H',  cat:'마트' },
  '코스트코':    { bg:'#005daa', color:'#fff',    letter:'C',  cat:'마트' },
  '맥도날드':    { bg:'#FFC72C', color:'#27251F', letter:'M',  cat:'식품' },
  '무신사':      { bg:'#000000', color:'#fff',    letter:'무', cat:'패션' },
};

function injectBrandLogos() {
  const LOGO = {
    baemin:     '로고/사경디_로고_배달의민족.svg',
    oliveyoung: '로고/사경디_로고_올리브영.svg',
    starbucks:  '로고/starbucks.svg',
    gs25:       '로고/GS25 logo.svg',
    cu:         '로고/CU logo.svg',
    yogiyo:     '로고/사경디_로고_요기요-01.svg',
    zara:       '로고/Zara.svg',
    uniqlo:     '로고/UNIQLO.svg',
    megacoffee: '로고/메가커피.svg',
    parisbaguette: '로고/Paris_Baguette.svg',
    musinsa:    '로고/무신사.svg',
    bbq:        '로고/BBQ logo.svg',
    bhc:        '로고/BHC logo.svg',
    domino:     '로고/도미노피자 logo.svg',
  };

  function getLogoSrc(id) { return LOGO[id] || null; }

  function setImg(el, src, bg) {
    if (!el || el.querySelector('img.brand-logo-img')) return;
    el.innerHTML = '';
    if (bg) el.style.background = 'white';
    const img = document.createElement('img');
    img.src = src;
    img.className = 'brand-logo-img';
    img.alt = '';
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;border-radius:inherit;';
    el.appendChild(img);
  }

  function brandFromEl(el) {
    let node = el;
    for (let i = 0; i < 8; i++) {
      if (!node) break;
      const id = node.dataset && (node.dataset.id || node.dataset.brand);
      if (id) return id;
      node = node.parentElement;
    }
    return null;
  }

  // ── hm-img-circle & hm-h4-img ──────────────────────────────
  document.querySelectorAll('.hm-img-circle, .hm-h4-img').forEach(el => {
    const id = brandFromEl(el);
    const src = getLogoSrc(id);
    if (src) setImg(el, src, true);
  });

  // ── pts-lc-logo ─────────────────────────────────────────────
  document.querySelectorAll('.pts-list-card').forEach(card => {
    const id = card.getAttribute('onclick') && card.getAttribute('onclick').match(/showPointsDetail\('(\w+)'\)/)?.[1]
             || brandFromEl(card);
    const src = getLogoSrc(id);
    const logo = card.querySelector('.pts-lc-logo');
    if (src && logo) setImg(logo, src, true);
  });

  // ── wsh-brand-circle ────────────────────────────────────────
  document.querySelectorAll('.wsh-brand-cell').forEach(cell => {
    const id = cell.getAttribute('onclick')?.match(/wshOpenBrand\('(\w+)'\)/)?.[1]
             || brandFromEl(cell);
    const src = getLogoSrc(id);
    const circle = cell.querySelector('.wsh-brand-circle');
    if (src && circle) setImg(circle, src, true);
  });

  // ── wsh-cpn-logo-circle ─────────────────────────────────────
  document.querySelectorAll('.wsh-cpn-card').forEach(card => {
    const id = card.dataset.id || brandFromEl(card);
    const src = getLogoSrc(id);
    const circle = card.querySelector('.wsh-cpn-logo-circle');
    if (src && circle) setImg(circle, src, true);
  });

  // ── np-dl-circle ────────────────────────────────────────────
  document.querySelectorAll('.np-dl-item').forEach(item => {
    const id = (item.getAttribute('onclick') || '').match(/id:'(\w+)'/)?.[1]
             || brandFromEl(item);
    const src = getLogoSrc(id);
    const circle = item.querySelector('.np-dl-circle');
    if (src && circle) setImg(circle, src, true);
  });

  // ── np-brand-circle ─────────────────────────────────────────
  document.querySelectorAll('.np-brand-circle').forEach(el => {
    const classes = [...el.classList];
    const ids = ['baemin','oliveyoung','starbucks','gs25','cu','yogiyo','emart','lottemart','homeplus'];
    const id = classes.find(c => ids.includes(c)) || brandFromEl(el);
    const src = getLogoSrc(id);
    if (src) setImg(el, src, true);
  });

  // ── noti-brand-chip ─────────────────────────────────────────
  const LABEL_TO_ID = {
    '이마트': 'emart', '올리브영': 'oliveyoung', '스타벅스': 'starbucks',
    '배달의민족': 'baemin', '쿠팡': 'coupang', '요기요': 'yogiyo', 'GS25': 'gs25',
    'emart': 'emart', 'OLIVE<br>YOUNG': 'oliveyoung', 'STAR<br>BUCKS': 'starbucks',
    'coupang': 'coupang',
  };
  document.querySelectorAll('.noti-brand-chip').forEach(chip => {
    const label = chip.dataset.label || '';
    const id = LABEL_TO_ID[label];
    const src = getLogoSrc(id);
    if (!src) return;
    const span = chip.querySelector('span');
    if (!span || span.textContent === '+') return;
    const w = span.offsetWidth || 36; const h = span.offsetHeight || 36;
    span.innerHTML = '';
    span.style.cssText = 'background:white;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:2px;';
    const img = document.createElement('img');
    img.src = src; img.alt = label; img.className = 'brand-logo-img';
    img.style.cssText = 'width:32px;height:32px;object-fit:contain;display:block;border-radius:6px;';
    span.appendChild(img);
  });

  // ── connect-service-logo ────────────────────────────────────
  document.querySelectorAll('.connect-service-logo').forEach(el => {
    const classes = [...el.classList];
    const ids = ['baemin','oliveyoung','starbucks','gs25','cu','yogiyo','emart','coupang'];
    const id = classes.find(c => ids.includes(c)) || brandFromEl(el);
    const src = getLogoSrc(id);
    if (src) { el.textContent = ''; setImg(el, src, true); }
  });

  // ── nbs-logo (dynamically rendered — patch source data) ────
  // NBS cards are rendered from data with s.logo = single char; we patch after render
  document.querySelectorAll('.nbs-logo').forEach(el => {
    const id = brandFromEl(el);
    const src = getLogoSrc(id);
    if (src) setImg(el, src, true);
  });
}

/* ============================================================ BARCODE ============================================================ */
function drawBRC() {
  const svg=document.getElementById('brcSvg'); if(!svg)return; svg.innerHTML='';
  const pat=[1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0,0,1,1,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0,0];
  const bw=300/pat.length;
  pat.forEach((on,i)=>{ if(!on)return; const r=document.createElementNS('http://www.w3.org/2000/svg','rect'); r.setAttribute('x',i*bw);r.setAttribute('y',0);r.setAttribute('width',bw*.7);r.setAttribute('height',100);r.setAttribute('fill','#111111'); svg.appendChild(r); });
}
function drawDetBRC() {
  const svg=document.getElementById('detBrcSvg'); if(!svg)return; svg.innerHTML='';
  const pat=[1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0,0,1,1,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,1,0,1,0,0];
  const bw=400/pat.length;
  pat.forEach((on,i)=>{ if(!on)return; const r=document.createElementNS('http://www.w3.org/2000/svg','rect'); r.setAttribute('x',i*bw);r.setAttribute('y',0);r.setAttribute('width',bw*.72);r.setAttribute('height',120);r.setAttribute('fill','#111'); svg.appendChild(r); });
}

/* ============================================================ DOWNLOAD BTN ============================================================ */
const downloadedCpns = new Set();

/* ── 홈 Rolling Title ── */
const _ROLLING_KWS = ['카페 쿠폰','베이커리','마트 할인','외식 카테고리','편의점 혜택','스타벅스 쿠폰'];
let _rollingIdx   = 0;
let _rollingTimer = null;

function startRollingTitle() {
  const el = document.getElementById('hsbRollingKw');
  if (!el) return;
  if (_rollingTimer) clearInterval(_rollingTimer);
  _rollingIdx = 0;
  el.textContent = _ROLLING_KWS[0];
  el.style.animation = 'none';
  _rollingTimer = setInterval(() => {
    const kw = document.getElementById('hsbRollingKw');
    if (!kw) { clearInterval(_rollingTimer); return; }
    kw.style.animation = 'hsbRollOut .28s cubic-bezier(.4,0,.2,1) forwards';
    setTimeout(() => {
      _rollingIdx = (_rollingIdx + 1) % _ROLLING_KWS.length;
      kw.textContent = _ROLLING_KWS[_rollingIdx];
      kw.style.animation = 'hsbRollIn .28s cubic-bezier(0,0,.2,1) forwards';
    }, 280);
  }, 3000);
}

function goSvcNext() {
  const selected = [...document.querySelectorAll('#p-connect-svc-select .svc-sel-card.sel')];
  if (selected.length === 0) return;
  const count = selected.length;
  const titleEl = document.getElementById('connectPageTitle');
  if (titleEl) titleEl.textContent = count === 1
    ? (selected[0].dataset.svcName || selected[0].dataset.svc) + ' 연동'
    : count + '개 서비스 연동';
  const subEl = document.querySelector('#p-connect .page-sub');
  if (subEl) subEl.textContent = '연동 방식을 선택하세요. 자동 연동을 추천드려요.';
  showAppPage('connect');
}

function handleDownload(btn) {
  if (btn.classList.contains('loading') || btn.classList.contains('done')) return;
  const id = btn.closest('[data-id]')?.dataset.id || S.currentCpnId || '';
  if (id) downloadedCpns.add(id);
  const iconWrap = btn.querySelector('.pdb-icon-wrap');
  const textEl   = btn.querySelector('.pdb-text');
  btn.classList.add('loading');
  if (iconWrap) iconWrap.innerHTML = '<div class="pdb-spinner"></div>';
  setTimeout(() => {
    btn.classList.remove('loading');
    btn.classList.add('done');
    if (iconWrap) {
      iconWrap.innerHTML = '✓';
      iconWrap.style.cssText = 'background:#dcfce7;color:#16a34a;transform:translateX(0)';
    }
    if (textEl) textEl.textContent = '다운로드 완료';
    // 상세 페이지 내 두 버튼 동기화 (헤드 ↔ 플로팅)
    ['detHeadDlBtn','detFloatDlBtn'].forEach(bid => {
      const other = document.getElementById(bid);
      if (!other || other === btn) return;
      const ow = other.querySelector('.pdb-icon-wrap');
      const ot = other.querySelector('.pdb-text');
      other.classList.remove('loading'); other.classList.add('done');
      if (ow) { ow.innerHTML='✓'; ow.style.cssText='background:#dcfce7;color:#16a34a;transform:translateX(0)'; }
      if (ot) ot.textContent = '다운로드 완료';
    });
  }, 1200);
}

/* ── 홈 카테고리별 브랜드 데이터 ── */
const HOME_BRANDS = {
  all:         [{label:'이마트',id:'emart'},{label:'GS25',id:'gs25'},{label:'롯데마트',id:'lottemart'},{label:'배달의민족',id:'baemin'},{label:'요기요',id:'yogiyo'},{label:'스타벅스',id:'starbucks'},{label:'올리브영',id:'oliveyoung'},{label:'쿠팡',id:'coupang'}],
  mart:        [{label:'이마트',id:'emart'},{label:'롯데마트',id:'lottemart'},{label:'홈플러스',id:'homeplus'},{label:'이마트24',id:'emart24'}],
  convenience: [{label:'GS25',id:'gs25'},{label:'CU',id:'cu'},{label:'세븐일레븐',id:'seven'},{label:'이마트24',id:'emart24'},{label:'미니스톱',id:'ministop'}],
  delivery:    [{label:'배달의민족',id:'baemin'},{label:'요기요',id:'yogiyo'},{label:'쿠팡이츠',id:'coupangeats'},{label:'위메프오',id:'wemakeprice'}],
  cafe:        [{label:'스타벅스',id:'starbucks'},{label:'투썸플레이스',id:'twosome'},{label:'이디야',id:'ediya'},{label:'메가커피',id:'mega'},{label:'컴포즈',id:'compose'}],
  fashion:     [{label:'올리브영',id:'oliveyoung'},{label:'무신사',id:'musinsa'},{label:'나이키',id:'nike'},{label:'유니클로',id:'uniqlo'}],
  travel:      [{label:'야놀자',id:'yanolja'},{label:'여기어때',id:'yeogi'},{label:'제주항공',id:'jeju'},{label:'하나투어',id:'hanatour'}],
};

let _homeSvc = 'all';
let _homeBrand = 'all';

function renderHomeBrandRow(svc) {
  const row  = document.getElementById('homeBrandRow');
  const wrap = document.getElementById('homeBrandWrap');
  if (!row) return;

  /* 전체 선택 시 → 브랜드 행 collapse */
  if (svc === 'all') {
    if (wrap) wrap.classList.remove('open');
    row.innerHTML = '';
    _homeBrand = 'all';
    return;
  }

  /* 특정 카테고리 → 칩 렌더 + slide-down + stagger fade-in */
  const brands = HOME_BRANDS[svc] || [];
  const allChip = `<div class="home-brand-chip sel" data-bid="all" onclick="setHomeBrand('all',this)" style="animation-delay:0ms">전체</div>`;
  const brandChips = brands.map((b, i) =>
    `<div class="home-brand-chip" data-bid="${b.id}" onclick="setHomeBrand('${b.id}',this)" style="animation-delay:${(i + 1) * 45}ms">${b.label}</div>`
  ).join('');
  row.innerHTML = allChip + brandChips;
  _homeBrand = 'all';

  /* 래퍼가 이미 open 상태면 닫았다 열어 애니메이션 재실행 */
  if (wrap) {
    wrap.classList.remove('open');
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  }
}

function setHomeSvcCat(svc, el) {
  _homeSvc = svc;
  _homeBrand = 'all';
  // Support both old and new chip classes
  document.querySelectorAll('#homeCatChips .home-cat-chip').forEach(c => c.classList.toggle('sel', c.dataset.svc === svc));
  document.querySelectorAll('#homeCatChips .home-cat-chip-v2').forEach(c => {
    const isActive = c.dataset.svc === svc;
    c.classList.toggle('sel', isActive);
    const dot = c.querySelector('.hcc-dot');
    if (dot) dot.style.display = isActive ? '' : 'none';
    if (isActive && !dot) { c.innerHTML = '<span class="hcc-dot">•</span> ' + c.textContent.trim(); }
  });
  const sel = document.getElementById('hsbCatSel'); if (sel) sel.value = svc;
  renderHomeBrandRow(svc);
  _applyHomeFilter();
}

function setHomeBrand(bid, el) {
  _homeBrand = bid;
  document.querySelectorAll('#homeBrandRow .home-brand-chip').forEach(c => c.classList.toggle('sel', c.dataset.bid === bid));
  _applyHomeFilter();
}

/* ── 오늘의 추천 쿠폰 — Center Focus Carousel (양방향 무한 루프) ── */
let _recIdx    = 1;   // 시작은 1 (앞쪽 클론 다음이 실제 첫 카드)
let _recOrigN  = 0;
let _recTimer  = null;
let _recLocked = false;
let _recInited = false;

// 실제 카드 너비 + gap 을 DOM 에서 읽어 동적 계산
function _getRecStep() {
  const track = document.getElementById('homeRecTrack');
  if (!track) return 232;
  const card = track.querySelector('.hrc-v2') || track.querySelector('.home-rec-card');
  if (!card) return 232;
  const gap = parseFloat(window.getComputedStyle(track).gap) || 12;
  return card.offsetWidth + gap;
}

function _updateDots(activeIdx, total) {
  const dots = document.querySelectorAll('#hrcDots .hrc-dot');
  dots.forEach((d, i) => d.classList.toggle('hrc-dot-active', i === activeIdx));
}

function updateRecCarousel(newIdx, instant) {
  if (_recLocked && !instant) return;
  const track = document.getElementById('homeRecTrack');
  if (!track) return;
  const isV2 = !!track.querySelector('.hrc-v2');
  const selector = isV2 ? '.hrc-v2' : '.home-rec-card';
  const cards = [...track.querySelectorAll(selector)];
  const n = cards.length;
  const orig = _recOrigN || (n - 2);
  if (n < 3) return;

  _recIdx = Math.max(0, Math.min(newIdx, n - 1));

  cards.forEach((card, i) => {
    const vi   = (i - 1 + orig) % orig;
    const vr   = (_recIdx - 1 + orig) % orig;
    const dist = Math.min(Math.abs(vi - vr), orig - Math.abs(vi - vr));
    if (isV2) {
      card.classList.remove('hrc-v2-active', 'hrc-v2-adj', 'hrc-v2-far');
      if      (dist === 0) card.classList.add('hrc-v2-active');
      else if (dist === 1) card.classList.add('hrc-v2-adj');
      else                 card.classList.add('hrc-v2-far');
    } else {
      card.classList.remove('rec-active', 'rec-adj', 'rec-far');
      if      (dist === 0) card.classList.add('rec-active');
      else if (dist === 1) card.classList.add('rec-adj');
      else                 card.classList.add('rec-far');
    }
  });

  // 도트 업데이트
  const dotIdx = (_recIdx - 1 + orig) % orig;
  _updateDots(dotIdx, orig);

  const step = _getRecStep();

  if (instant) track.style.transition = 'none';
  track.style.transform = `translateX(${-_recIdx * step}px)`;
  if (instant) requestAnimationFrame(() => { track.style.transition = ''; });

  if (!instant && _recIdx === n - 1) {
    _recLocked = true;
    setTimeout(() => { updateRecCarousel(1, true); _recLocked = false; }, 430);
    return;
  }
  if (!instant && _recIdx === 0) {
    _recLocked = true;
    setTimeout(() => { updateRecCarousel(orig, true); _recLocked = false; }, 430);
    return;
  }

  if (!instant) {
    _recLocked = true;
    setTimeout(() => { _recLocked = false; }, 450);
  }
}

function scrollRecCar(dir) {
  // 자동(dir=null)·수동 모두 항상 이동 — 클론이 양쪽에 있으므로 끊김 없음
  updateRecCarousel(_recIdx + (dir === null ? 1 : dir));
}

function startRecAuto() {
  stopRecAuto();
  _recTimer = setInterval(() => scrollRecCar(null), 3500);
}
function stopRecAuto() {
  if (_recTimer) { clearInterval(_recTimer); _recTimer = null; }
}
function scrollRecCarManual(dir) {
  stopRecAuto();
  scrollRecCar(dir);
  startRecAuto();
}

function initRecCarousel() {
  const wrap  = document.querySelector('.home-rec-track-wrap');
  const track = document.getElementById('homeRecTrack');
  if (!wrap || !track) return;

  const isV2 = !!track.querySelector('.hrc-v2');
  const selector = isV2 ? '.hrc-v2' : '.home-rec-card';

  // 양쪽 클론 설치 (최초 1회만)
  if (!_recInited) {
    const origCards = [...track.querySelectorAll(selector)];
    _recOrigN = origCards.length;

    const cloneBeg = origCards[origCards.length - 1].cloneNode(true);
    cloneBeg.setAttribute('aria-hidden', 'true');
    cloneBeg.removeAttribute('data-action');
    track.insertBefore(cloneBeg, origCards[0]);

    const cloneEnd = origCards[0].cloneNode(true);
    cloneEnd.setAttribute('aria-hidden', 'true');
    cloneEnd.removeAttribute('data-action');
    track.appendChild(cloneEnd);
  }

  _recIdx = 1;
  updateRecCarousel(1, true);
  startRecAuto();

  if (_recInited) return;
  _recInited = true;

  wrap.addEventListener('mouseenter', stopRecAuto);
  wrap.addEventListener('mouseleave', () => { if (!_recTimer) startRecAuto(); });

  let _dragX    = null;
  let _wasDrag  = false;
  let _justDrag = false;

  wrap.addEventListener('pointerdown', e => {
    _dragX   = e.clientX;
    _wasDrag = false;
    track.style.transition = 'none';
    try { wrap.setPointerCapture(e.pointerId); } catch(_) {}
    stopRecAuto();
  });

  wrap.addEventListener('pointermove', e => {
    if (_dragX === null) return;
    const dx = e.clientX - _dragX;
    if (Math.abs(dx) > 8) _wasDrag = true;
    if (_wasDrag) {
      const step = _getRecStep();
      track.style.transform = `translateX(${-_recIdx * step + dx}px)`;
    }
  });

  const endDrag = e => {
    if (_dragX === null) return;
    const dx = e.clientX - _dragX;
    _justDrag = _wasDrag;
    _dragX = null; _wasDrag = false;
    track.style.transition = '';
    if (_justDrag && Math.abs(dx) > 50) {
      updateRecCarousel(_recIdx + (dx < 0 ? 1 : -1));
    } else {
      updateRecCarousel(_recIdx, true);
    }
    startRecAuto();
  };
  wrap.addEventListener('pointerup',     endDrag);
  wrap.addEventListener('pointercancel', endDrag);

  wrap.addEventListener('click', e => {
    if (_justDrag) { _justDrag = false; return; }
    const card = e.target.closest(selector);
    if (!card) return;

    const isActive = isV2 ? card.classList.contains('hrc-v2-active') : card.classList.contains('rec-active');
    const isAdj    = isV2 ? card.classList.contains('hrc-v2-adj')    : card.classList.contains('rec-adj');

    if (isActive) {
      // 중앙 카드 탭 → 상세 페이지로 직접 이동
      const id = card.dataset.id;
      if (id && ACT['go-detail']) {
        ACT['go-detail']({ target: card, currentTarget: card });
      }
      return;
    }

    if (isAdj) {
      const id = card.dataset.id;
      if (id && ACT['go-detail']) {
        ACT['go-detail']({ target: card, currentTarget: card });
      }
    }
  });
}

/* ============================================================ EVENT DELEGATION ============================================================ */
const ACT = {
  'go-phone': ()=>{
    const id = document.querySelector('#s-signup-id input[type=text]')?.value.trim();
    const pw = document.getElementById('signupPw')?.value.trim();
    const pwc = document.getElementById('signupPwConfirm')?.value.trim();
    if (!id || !pw || !pwc) { showToast('모든 항목을 입력해 주세요'); return; }
    if (pw !== pwc) { showToast('비밀번호가 일치하지 않아요'); return; }
    go('phone');
  },
  'go-social-kakao': ()=>showSocialLogin('kakao'),
  'go-social-naver': ()=>showSocialLogin('naver'),
  'go-social-toss':  ()=>showSocialLogin('toss'),
  'go-terms-content':   ()=>go('terms-content'),
  'go-privacy-content': ()=>go('privacy-content'),
  'go-signup':       ()=>{ go('login'); setTimeout(()=>showLoginTab('signup'), 50); },
  'send-sms': ()=>{
    const ph = (document.getElementById('phField')?.value||'').replace(/-/g,'');
    if (ph.length < 10) { showToast('올바른 휴대폰 번호를 입력해 주세요'); return; }
    document.getElementById('otpPanel').classList.add('vis');
    document.getElementById('otpField').focus();
    startOTPTimer();
  },
  'resend-sms': ()=>{ startOTPTimer(); showToast('인증번호를 재전송했습니다'); },
  'go-coupon-intro': ()=>go('coupon-intro'),
  'go-loading':      ()=>go('loading'),
  'go-integration':  ()=>go('integration'),
  'go-age':          ()=>go('age'),
  'go-category':     ()=>go('category'),
  'go-brand':        ()=>go('brand'),
  'go-discount':     ()=>{ go('discount'); setTimeout(initDiscArc, 60); },
  'go-notification': ()=>go('notification'),
  'go-wallet-setup': ()=>go('wallet-setup'),
  'sel-age': (e)=>{
    const opt = e.target.closest('.age-option');
    if (!opt) return;
    document.querySelectorAll('#s-age .age-option').forEach(el => {
      el.style.border = '2px solid var(--gray-200)';
      el.style.background = 'white';
      el.querySelector('div > div:first-child').style.color = 'var(--gray-900)';
      el.classList.remove('sel');
    });
    opt.style.border = '2px solid var(--primary)';
    opt.style.background = 'var(--primary-lt)';
    opt.querySelector('div > div:first-child').style.color = 'var(--primary)';
    opt.classList.add('sel');
  },
  'go-login':        ()=>go('login'),
  'go-terms':        ()=>go('terms'),
  'go-signup-info':  ()=>{ go('signup-info'); setTimeout(initBirthDropdowns, 50); },
  'go-signup-id': ()=>{
    const name = document.getElementById('siName')?.value.trim();
    const phone = (document.getElementById('siPhone')?.value||'').replace(/-/g,'');
    const emailId = document.getElementById('emailId')?.value.trim();
    const birthY = document.getElementById('birthY')?.value.trim();
    if (!name) { showToast('이름을 입력해 주세요'); return; }
    if (!birthY || birthY.length < 4) { showToast('생년월일을 입력해 주세요'); return; }
    if (phone.length < 10) { showToast('올바른 휴대폰 번호를 입력해 주세요'); return; }
    if (!emailId) { showToast('이메일을 입력해 주세요'); return; }
    go('signup-id');
  },
  'go-more-connect': ()=>go('more-connect'),
  'go-integration-full': ()=>go('more-connect'),
  'go-signup-complete': ()=>{
    S.isConnected = true;
    localStorage.setItem('useHasVisited', '1');
    const ttl = document.querySelector('#s-signup-complete .ob-h2');
    if (ttl) ttl.textContent = '알림 설정이 완료되었어요';
    go('signup-complete');
    clearTimeout(S._signupTimer);
    S._signupTimer = setTimeout(()=>{ showNotiSetupPopup(); }, 2500);
  },
  'go-connect-complete': ()=>{
    S.isConnected = true;
    localStorage.setItem('useHasVisited', '1');
    const ttl = document.querySelector('#s-signup-complete .ob-h2');
    if (ttl) ttl.textContent = '연동 설정이 완료되었어요';
    go('signup-complete');
    clearTimeout(S._signupTimer);
    S._signupTimer = setTimeout(()=>{ showNotiSetupPopup(); }, 2500);
  },
  'go-home-empty': ()=>showNotiSetupPopup(),
  'go-noti-consent': ()=>go('noti-consent'),
  'nav-noti-alert':  ()=>{ showAppPage('noti-alert'); updateSidebar('noti-alert'); setTimeout(initNearbyMap, 150); nmapSelectChip('all', document.getElementById('nmapChipAll')); },
  'noti-download':   ()=>{ showToast('쿠폰함에 저장되었어요! 결제 시 자동으로 적용됩니다 ✓'); setTimeout(()=>{ showAppPage('wallet'); updateSidebar('wallet'); applyWalletFilter(wCat,wSort); },1200); },
  'go-home':         ()=>{
    if (S.cur === 'signup-complete') {
      S.isConnected = true;
      localStorage.setItem('useHasVisited', '1');
    }
    go('home');
  },
  'go-detail': (e)=>{
    /* ── USE_COUPONS 기반 상세 페이지 데이터 로드 ── */
    const BRAND_URLS = {
      '배달의민족':'https://www.baemin.com','요기요':'https://www.yogiyo.co.kr',
      '쿠팡이츠':'https://www.coupangeats.com','BBQ':'https://www.bbq.co.kr',
      'BHC':'https://www.bhc.co.kr','도미노피자':'https://www.dominos.co.kr',
      '올리브영':'https://www.oliveyoung.co.kr','무신사':'https://www.musinsa.com',
      '아디다스':'https://www.adidas.co.kr','유니클로':'https://www.uniqlo.com/kr',
      'ZARA':'https://www.zara.com/kr','이디야커피':'https://ediya.com',
      '공차':'https://www.gongcha.co.kr','다이소':'https://www.daisomall.co.kr',
      'CGV':'https://www.cgv.co.kr','롯데시네마':'https://www.lottecinema.co.kr',
      '메가박스':'https://www.megabox.co.kr','에버랜드':'https://www.everland.com',
      '롯데월드':'https://adventure.lotteworld.com','교보문고':'https://www.kyobobook.co.kr',
      '예스24':'https://www.yes24.com',
    };
    const DETAIL_INFO_MAP = {
      '스타벅스':'일부 특수 매장 및 사이렌오더 제외 매장에서는 사용이 제한될 수 있습니다.<br>잔액은 유효기간 내 재사용 가능하며 현금으로 환불되지 않습니다.',
      '투썸플레이스':'동일 음료 2잔 주문 시 1잔 무료로 제공됩니다.<br>일부 시즌 한정 음료는 적용이 제한될 수 있습니다.',
      '이디야커피':'앱 결제 시에만 사용 가능한 전용 할인 쿠폰입니다.<br>5,000원 이상 결제 시 적용 가능하며 다른 쿠폰과 중복 사용할 수 없습니다.',
      '메가커피':'텀블러 및 머그 구매 시에만 적용 가능한 MD 상품 할인권입니다.<br>일부 특수 매장에서는 사용이 제한될 수 있습니다.',
      '공차':'전국 매장 및 공식 앱에서 사용 가능한 모바일 기프트카드입니다.<br>잔액은 유효기간 내 재사용 가능합니다.',
      '나이키':'전국 팩토리 아웃렛에서만 사용 가능한 추가 할인 쿠폰입니다.<br>아웃렛 할인가에 추가 적용되며 정가 상품에는 적용이 제한됩니다.',
      '아디다스':'현대카드로 5만원 이상 결제 시 주문서에서 적용 가능합니다.<br>타 카드사 결제 또는 5만원 미만 결제 시 사용이 불가합니다.',
      '무신사':'3만원 이상 구매 시 앱 및 오프라인 매장에서 사용 가능합니다.<br>일부 브랜드 및 한정 상품에는 적용이 제한될 수 있습니다.',
      '유니클로':'공식 온라인 스토어 첫 구매 회원에 한해 사용 가능합니다.<br>오프라인 매장에서는 사용이 불가하며 반품/환불 시 쿠폰은 복구되지 않습니다.',
      'ZARA':'10만원 이상 구매 시 공식몰 및 오프라인 직영점에서 사용 가능합니다.<br>세일 상품 또는 생일 이외 기간에는 적용이 제한될 수 있습니다.',
      '올리브영':'오프라인 매장과 온라인몰에서 사용할 수 있으며 일부 브랜드는 제외됩니다.<br>행사 상품 및 멤버십 쿠폰과 중복 적용이 제한될 수 있습니다.',
      '다이소':'온라인몰에서 8만원 이상 주문 시 사용 가능한 직송 할인 쿠폰입니다.<br>오프라인 매장에서는 사용이 불가합니다.',
      '이마트':'상품별 조기 소진될 수 있으며 매장 상황에 따라 상품이 없을 수도 있습니다.<br>본 할인은 매장 내 행사 및 증정상품 프로모션과 중복 적용이 불가합니다.',
      '홈플러스':'서비스 품목(담배, 택배 등)은 금액상품권 사용이 제한됩니다.<br>전국 홈플러스 매장에서 현금처럼 사용할 수 있으며, 잔액은 재사용 가능합니다.',
      'GS25':'일부 특수 매장에서는 사용이 제한될 수 있습니다.<br>담배, 주류, 서비스 상품 등 일부 품목은 할인 대상에서 제외됩니다.',
      'CU':'전국 CU 편의점에서 수입맥주 4캔 이상 구매 시 사용 가능합니다.<br>담배, 주류(수입맥주 제외), 서비스 상품에는 적용이 제한됩니다.',
      '배달의민족':'배달의민족 앱에서 주문 시 적용할 수 있습니다.<br>일부 브랜드와 배달팁, 주류 주문에는 적용이 제한될 수 있습니다.',
      '요기요':'요기요 앱 주문에 한해 사용할 수 있으며 배달비가 무료로 제공됩니다.<br>매장별 최소 주문 금액과 배달 가능 지역을 확인해 주세요.',
      '쿠팡이츠':'쿠팡이츠 앱에서 포장 주문 시 사용 가능한 쿠폰입니다.<br>1만 2천원 이상 주문 시 적용되며 일부 매장은 제외됩니다.',
      'BBQ':'신규 가입 후 즉시 지급되는 쿠폰으로 사용 기간 내 1회에 한해 적용 가능합니다.<br>일부 프로모션 메뉴와 중복 사용이 제한될 수 있습니다.',
      'BHC':'황금올리브 치킨 메뉴에 한해 적용되는 할인 쿠폰입니다.<br>공식 앱 및 매장 전화 주문 시 사용 가능합니다.',
      '도미노피자':'치킨 메인 메뉴 1마리 이상 주문 시 사이드메뉴가 무료로 제공됩니다.<br>공식 앱 및 매장 주문에서만 사용 가능합니다.',
      'CGV':'기프트샵에서 3만원 이상 기념품 구매 시 사용 가능합니다.<br>영화 티켓 및 팝콘 등 매점 상품에는 적용이 제한됩니다.',
      '롯데시네마':'월~목 상영 영화 예매 시 적용 가능한 평일 할인 쿠폰입니다.<br>주말 및 공휴일에는 사용이 불가하며 특별 상영관은 제외됩니다.',
      '메가박스':'2D 일반 영화 좌석에 적용 가능한 할인 쿠폰입니다.<br>4DX, IMAX 등 특별 상영관 및 프리미엄 좌석에는 적용이 제한됩니다.',
      '에버랜드':'IMAX, 돌비 등 특별 상영관 예매 시에만 사용 가능합니다.<br>일반관 및 현장 구매에는 적용이 불가합니다.',
      '롯데월드':'매점 및 패스트오더에서 팝콘 라지 사이즈 단품 구매 시 사용 가능합니다.<br>기타 음식 및 굿즈 상품에는 적용이 제한됩니다.',
      '교보문고':'매장 내 문구 코너에서 1만원 이상 구매 시 사용 가능합니다.<br>도서 및 전자기기 등 다른 상품에는 적용이 불가합니다.',
      '예스24':'온라인 공식몰에서 도서 정가제 적용 도서 1만원 이상 구매 시 사용 가능합니다.<br>일부 할인 도서 및 중고책에는 적용이 제한될 수 있습니다.',
      '알라딘':'오프라인 중고매장에서 중고도서 2만원 이상 구매 시 사용 가능합니다.<br>온라인몰 및 신간 서적에는 적용이 불가합니다.',
    };

    const fmtDate = iso => {
      const d = new Date(iso + 'T00:00:00');
      return `${iso.replace(/-/g,'.')} (${['일','월','화','수','목','금','토'][d.getDay()]}) 까지`;
    };
    const formatWon = v => `${Math.max(0, Math.round(v||0)).toLocaleString('ko-KR')}원`;

    const tgt = e.target || e.currentTarget;
    const el  = (tgt?.dataset?.id) ? tgt : tgt?.closest?.('[data-id]');
    const id  = el?.dataset?.id || '';

    // USE_COUPONS에서 직접 조회 (CP-xxx ID)
    const cpn = USE_COUPONS.find(c => c.id === id);
    if (!cpn) { console.warn('go-detail: coupon not found', id); return; }

    S.currentCpnId = id;

    // 채널 매핑
    const chRaw = cpn.channel || '오프라인';
    const chKey = chRaw === '온라인' ? 'online' : chRaw === '온오프라인' ? 'both' : 'offline';

    // 쿠폰명에서 [브랜드] 접두어 제거
    const cpnTitle = cpn.name.replace(new RegExp('^\\[' + cpn.brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\]\\s*'), '');
    const bg   = cpnBgColor(cpn.brand);
    const icon = cpnInitial(cpn.brand);
    const dday    = cpnDday(cpn.expiry);
    const ddayNum = cpnDdayNum(cpn.expiry);

    // 브랜드 아이콘
    const iconEl = document.getElementById('detBrandIcon');
    if (iconEl) { iconEl.textContent = icon; iconEl.style.background = bg; iconEl.style.color = 'white'; }

    const setTxt = (i,v) => { const el=document.getElementById(i); if(el) el.textContent=v; };
    setTxt('detBrandName', cpn.brand);
    setTxt('detBrandSub',  cpn.cond !== '없음' ? cpn.cond : cpn.cat);
    setTxt('detDday',      dday);
    setTxt('detCpnTitle',  cpnTitle);

    // D-day 뱃지 색상 (오늘만료 → urgent)
    const ddayPill = document.getElementById('detDday');
    if (ddayPill) ddayPill.className = 'det-dday-pill' + (ddayNum <= 0 ? ' urgent' : '');

    // 경고 바 (D-0 또는 D-1)
    const warnBar = document.getElementById('detWarningBar');
    if (warnBar) {
      warnBar.style.display = ddayNum <= 1 ? 'flex' : 'none';
      const wt = warnBar.querySelector('.det-warn-text');
      if (wt) wt.textContent = ddayNum <= 0 ? '오늘 만료됩니다' : '유효기간이 1일 남았습니다';
    }

    // 유효기간
    setTxt('detValidDate', fmtDate(cpn.expiry));

    // 사용처 + 채널 뱃지
    setTxt('detUsagePlace', cpn.place);
    const chBadge = document.getElementById('detChannelBadge');
    if (chBadge) chBadge.textContent = { offline:'오프라인', online:'온라인', both:'온·오프라인' }[chKey] || '오프라인';

    // 상세 정보 및 유의사항
    const infoWrap = document.getElementById('detInfoWrap');
    if (infoWrap) infoWrap.innerHTML = DETAIL_INFO_MAP[cpn.brand] || '해당 쿠폰의 유의사항을 확인 후 사용해 주세요.<br>일부 매장 및 상품에는 적용이 제한될 수 있습니다.';

    // 주변 사용 가능 매장 (NEARBY_STORES에서 브랜드 매칭)
    const nearbySection = document.getElementById('detNearbySection');
    const nearbyList    = document.getElementById('nearbyList');
    const stores = (typeof NEARBY_STORES !== 'undefined' ? NEARBY_STORES : [])
      .filter(s => s.key === cpn.brand && s.pinType !== 'point');
    if (nearbySection) nearbySection.style.display = stores.length ? '' : 'none';
    if (nearbyList) {
      nearbyList.innerHTML = stores.map(store => `
        <div class="det-store-card">
          <div class="det-store-img" style="background:${bg};color:var(--color-on-primary);display:flex;align-items:center;justify-content:center;font-weight:var(--font-weight-bold);font-size:var(--font-size-body)">${icon}</div>
          <div class="det-store-info">
            <div class="det-store-name">${store.name}</div>
            <div class="det-store-addr">${store.addr}</div>
            <div class="det-store-meta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${store.dist} · 영업중 · 도보 ${store.walk}
            </div>
          </div>
          <button class="det-store-arrow" type="button" aria-label="${store.name} 보기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `).join('');
    }

    // 분할/잔액 섹션 (split:true + 정액 쿠폰)
    const splitEl = document.getElementById('detSplitSection');
    const balEl   = document.getElementById('detBalanceSection');
    const hasSplit = cpn.split && cpn.discType === '정액';
    if (splitEl) splitEl.style.display = hasSplit ? 'flex' : 'none';
    if (balEl)   balEl.style.display   = hasSplit ? 'flex' : 'none';
    if (hasSplit) {
      const total  = cpn.benefit;
      const used   = Math.round(total * 0.3); // 데모: 30% 사용
      const remain = total - used;
      const pct    = Math.round((remain / total) * 100);
      setTxt('detBalanceVal',   formatWon(remain));
      setTxt('detBalanceTotal', ` / ${formatWon(total)}`);
      setTxt('detSplitStatus',  remain > 0 ? '사용 가능' : '사용 완료');
      const splitBar = document.getElementById('detSplitBarFill');
      if (splitBar) splitBar.style.width = `${pct}%`;
    }

    // 온라인 바로가기 버튼
    const linkWrap = document.getElementById('detOnlineLink');
    const linkBtn  = document.getElementById('detOnlineLinkBtn');
    const linkText = document.getElementById('detOnlineLinkText');
    const url = BRAND_URLS[cpn.brand] || null;
    if ((chKey === 'online' || chKey === 'both') && url) {
      if (linkWrap) linkWrap.style.display = '';
      if (linkBtn)  linkBtn.href = url;
      if (linkText) linkText.textContent = cpn.brand + ' 바로가기';
    } else {
      if (linkWrap) linkWrap.style.display = 'none';
    }

    // 바코드 섹션 항상 표시
    const brcSec = document.getElementById('detBrcSection');
    if (brcSec) brcSec.style.display = '';

    // 다운로드 버튼 상태 초기화
    [document.getElementById('detHeadDlBtn'), document.getElementById('detFloatDlBtn')].forEach(dlBtn => {
      if (!dlBtn) return;
      const iconW = dlBtn.querySelector('.pdb-icon-wrap');
      const textE = dlBtn.querySelector('.pdb-text');
      if (downloadedCpns.has(id)) {
        dlBtn.classList.remove('loading'); dlBtn.classList.add('done');
        if (iconW) { iconW.innerHTML='✓'; iconW.style.cssText='background:#dcfce7;color:#16a34a;transform:translateX(0)'; }
        if (textE) textE.textContent = '다운로드 완료';
      } else {
        dlBtn.classList.remove('loading','done');
        if (iconW) { iconW.innerHTML='↓'; iconW.style.cssText=''; }
        if (textE) textE.textContent = '저장하기';
      }
    });
    renderCouponDetailRecommendations(cpn);
    go('detail');
  },
  'go-barcode':      ()=>go('barcode'),
  'close-brc-popup': ()=>closeBrcPopup(),
  'nav-barcode':     ()=>{ showAppPage('barcode'); updateSidebar('barcode'); setTimeout(()=>{ const svg=document.getElementById('brcSvg'); if(svg){ svg.innerHTML=''; const pat=[1,0,1,1,0,1,0,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0,0,1,0,1,1,0,1,0,1]; const W=300, bw=W/pat.length; pat.forEach((on,i)=>{ if(!on)return; const r=document.createElementNS('http://www.w3.org/2000/svg','rect'); r.setAttribute('x',i*bw); r.setAttribute('y',0); r.setAttribute('width',bw*.72); r.setAttribute('height',100); r.setAttribute('fill','#111'); svg.appendChild(r); }); } },50); },
  'go-detail-back':  ()=>showAppPage('detail'),
  'go-back':         ()=>goBack(),
  'skip-to-login':   ()=>go('login'),
  'nav-noti-page': ()=>{ showAppPage('noti-page'); updateSidebar('noti-page'); },
  'nav-wishlist':  ()=>{ showAppPage('wishlist'); updateSidebar('wishlist'); },
  'nav-home':        ()=>{ showAppPage('home'); updateSidebar('home'); },
  'nav-points-hub':  ()=>{ showAppPage('points-hub'); updateSidebar('points-hub'); },
  'nav-benefits-coupons': ()=>{ showAppPage('points-hub'); updateSidebar('points-hub'); setTimeout(()=>switchBenefitsTab('cpn'), 30); },
  'pts-det-back':    ()=>goBack(),
  'nav-download':    ()=>{ showAppPage('download'); updateSidebar('download'); },
  'nav-wallet':      ()=>{ showAppPage('wallet'); updateSidebar('wallet'); applyWalletTab('downloaded'); },
  'nav-mypage':          ()=>{ showAppPage('mypage'); updateSidebar('mypage'); },
  'nav-mypage-noti':     ()=>{ showAppPage('mypage'); updateSidebar('mypage'); setTimeout(()=>showMypageSub('noti'), 50); },
  'nav-mypage-info':     ()=>{ showMypageSub('info'); },
  'nav-mypage-profile':  ()=>{ showAppPage('mypage'); updateSidebar('mypage'); setTimeout(()=>showMypageSub('profile'),50); },
  'mypage-tab':          (e)=>{ const tab=e.target.closest('[data-tab]'); if(!tab)return; const t=tab.dataset.tab; document.querySelectorAll('[data-action="mypage-tab"]').forEach(el=>el.classList.remove('on')); tab.classList.add('on'); showMypageSub(t); },
  'save-noti':           ()=>showToast('설정이 안전하게 변경되었습니다'),
  'noti-master':         (e)=>setNotiMasterCard(e.target.closest('[data-val]').dataset.val),
  'save-info':           ()=>showToast('설정이 안전하게 변경되었습니다'),
  'nav-connect':         ()=>{ showAppPage('connect-svc-select'); updateSidebar(''); },
  'nav-connect-svc':     ()=>{ showAppPage('connect-svc-select'); updateSidebar(''); },
  'nav-noti-settings':   ()=>{ showAppPage('noti-custom-setup'); updateSidebar(''); },
  'toggle-connect-svc': (e)=>{
    const toggle = e.target.closest('[data-action="toggle-connect-svc"]');
    if (!toggle || toggle.dataset.busy === '1') return;
    toggle.dataset.busy = '1';
    setTimeout(() => {
      toggle.dataset.busy = '';
      const input = toggle.querySelector('input[type="checkbox"]');
      if (!input || input.checked) return;
      const card = document.getElementById(toggle.dataset.card || '');
      const name = toggle.dataset.name || '서비스';
      if (card) {
        card.classList.add('connect-removing');
        setTimeout(() => { card.remove(); }, 240);
      }
      showToast(name + ' 연동이 해제되었습니다');
    }, 0);
  },
  'disconnect-svc': (e)=>{
    const btn = e.target.closest('[data-action="disconnect-svc"]');
    if (!btn) return;
    const name = btn.dataset.name || '서비스';
    const cardId = btn.dataset.card || '';
    const modal = document.getElementById('disconnectModal');
    const sub   = document.getElementById('disconnectModalSub');
    const confirmBtn = document.getElementById('disconnectConfirmBtn');
    const cancelBtn  = document.getElementById('disconnectCancelBtn');
    if (!modal) return;
    sub.textContent = name + ' 연동을 해제하면 해당 서비스의 쿠폰이 더 이상 자동으로 불러와지지 않아요.';
    modal.style.display = 'flex';
    const doClose = () => { modal.style.display = 'none'; confirmBtn.onclick = null; cancelBtn.onclick = null; };
    cancelBtn.onclick = doClose;
    confirmBtn.onclick = () => {
      const card = document.getElementById(cardId);
      if (card) {
        card.style.transition = 'opacity .25s';
        card.style.opacity = '0';
        setTimeout(() => { card.remove(); }, 280);
      }
      doClose();
      showToast(name + ' 연결이 해제되었습니다');
    };
  },
  'nav-connect-easy':    ()=>showAppPage('connect-easy'),
  'nav-connect-manual':  ()=>showAppPage('connect-manual'),
  'nav-connect-manual-form': ()=>{ if (!S.connectMethod) S.connectMethod = 'account'; showAppPage('connect-manual-form'); updateConnectForm(); },
  'nav-connect-success': ()=>showAppPage('connect-success'),
  'select-connect-method': (e)=>{
    const card = e.target.closest('[data-action="select-connect-method"]');
    if (!card) return;
    document.querySelectorAll('#p-connect .connect-type-card').forEach(el => el.classList.remove('sel'));
    card.classList.add('sel');
    const next = document.getElementById('connectMethodNextBtn');
    if (next) next.dataset.action = card.dataset.next || 'nav-connect-easy';
  },
  'select-manual-method': (e)=>{
    const card = e.target.closest('[data-action="select-manual-method"]');
    if (!card) return;
    S.connectMethod = card.dataset.method || 'account';
    document.querySelectorAll('[data-action="select-manual-method"]').forEach(el => el.classList.remove('sel'));
    document.querySelectorAll(`[data-action="select-manual-method"][data-method="${S.connectMethod}"]`).forEach(el => el.classList.add('sel'));
    updateConnectForm();
  },
  'select-svc':          (e)=>{
    const card = e.target.closest('[data-svc]');
    if (!card) return;
    card.classList.toggle('sel');
    const count = document.querySelectorAll('#p-connect-svc-select .svc-sel-card.sel').length;
    const btn = document.getElementById('svcNextBtn');
    if (btn) {
      btn.disabled = count === 0;
      btn.style.background = count > 0 ? 'var(--primary)' : 'var(--gray-300)';
      btn.style.cursor = count > 0 ? 'pointer' : 'not-allowed';
    }
  },
  'connect-method':      (e)=>{ const card=e.target.closest('[data-method]'); S.connectMethod=card.dataset.method; document.querySelectorAll('.auth-method-card').forEach(c=>c.classList.remove('sel')); card.classList.add('sel'); showAppPage('connect-manual-form'); updateConnectForm(); },
  'start-auth':          (e)=>{ const from=e.target.closest('[data-from]')?.dataset.from||'easy'; S.connectFrom=from; showAppPage('connect-auth'); runAuthAnimation(); },
  'connect-retry':       ()=>showAppPage(S.connectFrom==='manual'?'connect-manual-form':'connect-easy'),
  'connect-fail-demo':   ()=>{ if(S.authTimer){clearTimeout(S.authTimer);S.authTimer=null;} showAppPage('connect-fail'); },
  'toggle-cat':      (e)=>e.target.closest('.cat-chip').classList.toggle('sel'),
  'toggle-brand':    (e)=>e.target.closest('.brand-chip').classList.toggle('sel'),
  'brand-all':       ()=>document.querySelectorAll('#brandGrid .brand-chip').forEach(c=>c.classList.add('sel')),
  'brand-none':      ()=>document.querySelectorAll('#brandGrid .brand-chip').forEach(c=>c.classList.remove('sel')),
  'cat-all-toggle':  ()=>{
    const chips = document.querySelectorAll('#catGrid .cat-chip');
    const btn = document.getElementById('catAllToggle');
    const allSel = [...chips].every(c=>c.classList.contains('sel'));
    chips.forEach(c=>{ if(allSel) c.classList.remove('sel'); else c.classList.add('sel'); });
    if(btn){ btn.textContent = allSel ? '전체 선택' : '전체 해제'; btn.style.background = allSel ? 'var(--primary-lt)' : 'var(--gray-100)'; btn.style.borderColor = allSel ? 'var(--primary)' : 'var(--gray-300)'; btn.style.color = allSel ? 'var(--primary)' : 'var(--gray-500)'; }
  },
  'cat-all':         ()=>document.querySelectorAll('#catGrid .cat-chip').forEach(c=>c.classList.add('sel')),
  'cat-none':        ()=>document.querySelectorAll('#catGrid .cat-chip').forEach(c=>c.classList.remove('sel')),
  'toggle-svc':      (e)=>{ const btn=e.target.closest('.conn-btn'); const card=btn.closest('.svc-card'); btn.classList.toggle('done'); const isDone=btn.classList.contains('done'); btn.textContent=isDone?'✓ 연동 완료':'연동하기'; if(card) card.classList.toggle('connected',isDone); },
  'sel-discount':    (e)=>{ document.getElementById('discOpts').querySelectorAll('.opt-card').forEach(c=>c.classList.remove('sel')); e.target.closest('.opt-card').classList.add('sel'); },
  'sel-notif':       (e)=>{ document.getElementById('notifOpts').querySelectorAll('.opt-card').forEach(c=>c.classList.remove('sel')); e.target.closest('.opt-card').classList.add('sel'); },
  'download-cpn':    (e)=>handleDownload(e.target.closest('[data-action]')),
  'flt-home':        (e)=>{ document.querySelectorAll('[data-action="flt-home"]').forEach(b=>b.classList.remove('on')); e.target.closest('[data-action]').classList.add('on'); },
  'flt-dl':          (e)=>{ document.querySelectorAll('[data-action="flt-dl"]').forEach(b=>b.classList.remove('on')); e.target.closest('[data-action]').classList.add('on'); },
  'wlt-filter':      (e)=>{ document.querySelectorAll('[data-action="wlt-filter"]').forEach(b=>b.classList.remove('on')); const el=e.target.closest('[data-action]'); el.classList.add('on'); wCat=el.dataset.val; applyWalletFilter(wCat,wSort); const bar=document.getElementById('wltBrandBar'); if(bar) bar.style.display=(wCat==='food')?'block':'none'; if(wCat==='food'){ document.querySelectorAll('[data-action="wlt-brand"]').forEach(b=>b.classList.remove('on')); const ab=document.querySelector('[data-action="wlt-brand"][data-brand="all"]'); if(ab) ab.classList.add('on'); } },
  'wlt-brand':       (e)=>{ document.querySelectorAll('[data-action="wlt-brand"]').forEach(b=>b.classList.remove('on')); const el=e.target.closest('[data-action]'); el.classList.add('on'); const brand=el.dataset.brand; document.querySelectorAll('#walletGrid .cpn-card').forEach(c=>{ const txt=c.querySelector('.cpn-brand')?.textContent||''; c.style.display=(brand==='all'||txt.includes(brand))?'':'none'; }); },
  'wlt-sort':        (e)=>{ document.querySelectorAll('[data-action="wlt-sort"]').forEach(b=>b.classList.remove('on')); const el=e.target.closest('[data-action]'); el.classList.add('on'); wSort=el.dataset.val; applyWalletFilter(wCat,wSort); },
  'wlt-tab':         (e)=>{ document.querySelectorAll('.wlt-tab').forEach(t=>t.classList.remove('on')); const tab=e.target.closest('.wlt-tab'); tab.classList.add('on'); applyWalletTab(tab.dataset.status||'all'); },
  'src-filter':      (e)=>{ const btn=e.target.closest('[data-action="src-filter"]'); if(!btn)return; document.querySelectorAll('[data-action="src-filter"]').forEach(b=>b.classList.remove('on')); btn.classList.add('on'); const val=btn.dataset.val; const filtered=val==='all'?srcAllCards:srcAllCards.filter(c=>(c.dataset.cat||'')===val); renderSrcGrid(filtered); },
  'src-tab':         (e)=>{ const btn=e.target.closest('[data-action="src-tab"]'); if(!btn)return; document.querySelectorAll('[data-action="src-tab"]').forEach(b=>b.classList.remove('on')); btn.classList.add('on'); const st=btn.dataset.status; const filtered=st==='all'?srcAllCards:srcAllCards.filter(c=>(c.dataset.status||'')===st); renderSrcGrid(filtered); },
};

document.addEventListener('click', e=>{
  const el=e.target.closest('[data-action]'); if(!el)return;
  const a=el.dataset.action; if(ACT[a]) ACT[a](e);
});

// 지갑 페이지 버튼: "쿠폰받기" -> "사용하기", "사용하기" 재클릭 시 상세 이동
document.addEventListener('click', e => {
  const btn = e.target.closest('.wlt-get-btn');
  if (!btn) return;
  if (btn.classList.contains('done')) return;
  const label = btn.textContent.trim();
  if (label === '쿠폰받기') {
    btn.textContent = '사용하기';
    btn.classList.add('claimed');
    return;
  }
  if (label === '사용하기' || btn.classList.contains('claimed')) {
    const card = btn.closest('.cpn-card');
    if (card && ACT['go-detail']) ACT['go-detail']({ target: card });
  }
}, true);

/* ============================================================ INIT ============================================================ */
function initHmAutoRotate() {
  const track = document.getElementById('hmTrack');
  if (!track || track.dataset.hmReady) return;
  track.dataset.hmReady = '1';

  // 카드 복제 (seamless loop)
  const origCards = [...track.children];
  origCards.forEach(c => track.appendChild(c.cloneNode(true)));

  // 원본 세트 총 너비 계산 (card width + gap 16px)
  const gap = 16;
  let totalW = 0;
  origCards.forEach(c => { totalW += c.offsetWidth + gap; });
  track.style.setProperty('--hm-scroll-w', `-${totalW}px`);

  track.classList.add('hm-auto');

  // 터치 시 일시정지 후 재개
  track.addEventListener('touchstart', () => {
    track.style.animationPlayState = 'paused';
  }, { passive: true });
  track.addEventListener('touchend', () => {
    setTimeout(() => { track.style.animationPlayState = 'running'; }, 1500);
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', ()=>{
  // 3초 후 로그인 화면으로 자동 이동
  setTimeout(()=>{ go('main'); }, 1500);  // 파란 스플래시 1.5초 후 메인으로
  initCarousel();
  injectBrandLogos();
  normalizeHomeCardConditions();
  setTimeout(initHmAutoRotate, 200);
});
window.addEventListener('resize',()=>{ if(S.appPage==='home') goCar(S.carIdx); });


/* ============================================================ POINTS HUB ============================================================ */
const POINTS_DATA = [
  { id:'megabox', name:'메가박스', cat:'문화생활', bal:8500,  status:'usable',      exp:'D-3',  brc:'qr',     desc:'영화 예매 시 포인트 차감',   num:'2345 6789 0002' },
  { id:'gs25',    name:'GS25',    cat:'식품',    bal:3200,  status:'usable',      exp:'D-30', brc:'static', desc:'결제 시 바로 차감',           num:'9876 5432 1098' },
  { id:'cu',      name:'CU',      cat:'식품',    bal:1500,  status:'conditional', exp:'D-7',  brc:'static', desc:'5,000원 이상 구매 시 사용',   num:'3456 7890 0003' },
  { id:'lotte',   name:'롯데홈쇼핑', cat:'패션',  bal:6500,  status:'usable',      exp:'D-25', brc:'none',   desc:'롯데홈쇼핑 앱에서 사용 가능', num:'' },
  { id:'coupang', name:'쿠팡',     cat:'가전',    bal:7800,  status:'usable',      exp:'D-45', brc:'none',   desc:'쿠팡 앱에서 사용 가능',       num:'' },
];

function initPointsHub() {
  const skGrid = document.getElementById('ptsSkeletonGrid');
  const svGrid = document.getElementById('ptsSvcGrid');
  const totalEl = document.getElementById('ptsTotalNum');
  if (!skGrid) return;
  skGrid.style.display = 'grid';
  svGrid.style.display = 'none';
  if (totalEl) { totalEl.textContent = '0'; totalEl.style.filter = 'blur(4px)'; }
  // 드롭다운 초기값으로 바코드 세팅
  const sel = document.getElementById('repBrcSelect');
  switchRepBarcodeCard(sel ? sel.value : 'kt');
  setTimeout(() => {
    skGrid.style.display = 'none';
    svGrid.style.display = 'grid';
    if (totalEl) { totalEl.style.filter = ''; countUpPts(); }
    injectBrandLogos();
  }, 1200);
}

/* ── 대표 바코드 카드 데이터 — USE_POINTS 기반 자동 생성 ── */
function _genPat(seed) {
  // seed 기반으로 재현 가능한 바코드 패턴 55개 생성
  let s = seed; const pat = [];
  for (let i = 0; i < 55; i++) { s = (s * 1664525 + 1013904223) & 0xffffffff; pat.push((s >>> 16) & 1); }
  return pat;
}
function _genNum(id) {
  const n = id.replace(/\D/g, '').padStart(3, '0');
  return `${n}0-${Math.floor(Math.random()*9000+1000)}-${Math.floor(Math.random()*9000+1000)}-${Math.floor(Math.random()*90+10)}`;
}
const REP_BRC_DATA = {};
USE_POINTS.forEach((p, i) => {
  REP_BRC_DATA[p.id] = {
    label: p.name,
    issuer: p.issuer,
    balance: p.balance,
    num: `${String(i+1).padStart(4,'0')}-${(12345678 + i*111111).toString().slice(0,4)}-${(87654321 - i*99999).toString().slice(0,4)}-${i+1}`,
    pat: _genPat(i * 7919 + 1234),
  };
});

function toggleNotiMaster() {
  const btn = document.getElementById('notiMasterToggle');
  const lblOn  = document.getElementById('notiLblOn');
  const lblOff = document.getElementById('notiLblOff');
  const settings = document.getElementById('notiSettings');
  const offMsg   = document.getElementById('notiOffMsg');
  const isOn = btn.classList.toggle('on');
  if (lblOn)  lblOn.classList.toggle('active', isOn);
  if (lblOff) lblOff.classList.toggle('active', !isOn);
  if (settings) settings.style.display = isOn ? '' : 'none';
  if (offMsg)   offMsg.style.display   = isOn ? 'none' : 'block';
}
function initRepBrcSelect() {
  const sel = document.getElementById('repBrcSelect');
  if (sel && sel.options.length === 0) {
    USE_POINTS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      sel.appendChild(opt);
    });
  }
  switchRepBarcodeCard(USE_POINTS[0].id);
}

/* ── 커스텀 드롭다운 ── */
function toggleRepBrcDropdown() {
  const panel = document.getElementById('repBrcDdPanel');
  if (!panel) return;
  if (panel.classList.contains('open')) {
    closeRepBrcDropdown();
  } else {
    openRepBrcDropdown();
  }
}
function openRepBrcDropdown() {
  const panel = document.getElementById('repBrcDdPanel');
  const items = document.getElementById('repBrcDdItems');
  const overlay = document.getElementById('repBrcSheetOverlay');
  if (!panel || !items) return;
  const sel = document.getElementById('repBrcSelect');
  const activeId = sel && sel.value ? sel.value : USE_POINTS[0].id;
  // 항목 렌더
  items.innerHTML = USE_POINTS.map(p =>
    `<button class="pts-brc-dd-item${p.id === activeId ? ' is-selected' : ''}" type="button"
      onclick="event.stopPropagation(); selectRepBrc('${p.id}');">
        <span class="pts-brc-dd-check">${p.id === activeId ? '✓' : ''}</span>
        <span class="pts-brc-dd-name">${p.name}</span>
      </button>`
  ).join('');
  if (overlay) overlay.classList.add('open');
  panel.classList.add('open');
}
/* ── 포인트 상세 공유 바텀시트 ── */
function openPdetShare() {
  document.getElementById('pdetShareOverlay').classList.add('open');
  document.getElementById('pdetShareSheet').classList.add('open');
}
function closePdetShare() {
  document.getElementById('pdetShareOverlay').classList.remove('open');
  document.getElementById('pdetShareSheet').classList.remove('open');
}

function closeRepBrcDropdown() {
  const panel = document.getElementById('repBrcDdPanel');
  const overlay = document.getElementById('repBrcSheetOverlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.removeEventListener('click', _repBrcOutsideClick);
}
function selectRepBrc(id) {
  switchRepBarcodeCard(id);
  closeRepBrcDropdown();
}
function _repBrcOutsideClick(e) {
  const panel = document.getElementById('repBrcDdPanel');
  const wrap = document.getElementById('repBrcDdWrap');
  if (panel?.contains(e.target) || wrap?.contains(e.target)) return;
  closeRepBrcDropdown();
}

function switchRepBarcodeCard(key) {
  const d = REP_BRC_DATA[key]; if (!d) return;
  const lbl    = document.getElementById('repBrcBrandLbl');
  const num    = document.getElementById('repBrcNum');
  const logoEl = document.getElementById('repBrcLogo');
  if (lbl) lbl.textContent = d.label;
  if (num) num.textContent = d.num;
  // 브랜드 로고 원 업데이트 (색상 + 이니셜)
  if (logoEl) {
    const pt = (typeof USE_POINTS !== 'undefined' ? USE_POINTS : []).find(p => p.id === key);
    const issuer = pt ? pt.issuer : d.label;
    logoEl.style.background = cpnBgColor(issuer) || 'var(--color-primary)';
    logoEl.textContent = issuer.charAt(0);
  }
  // 드롭다운 라벨은 "브랜드 변경" 고정 — 업데이트 불필요
  // select 동기화
  const sel = document.getElementById('repBrcSelect');
  if (sel && sel.value !== key) sel.value = key;
  // pts-total-card: 선택된 브랜드 잔여 포인트 반영
  const pt = (typeof USE_POINTS !== 'undefined' ? USE_POINTS : []).find(p => p.id === key);
  const totalLabelEl = document.getElementById('ptsTotalLabel');
  const totalNumEl   = document.getElementById('ptsTotalNum');
  const totalExpEl   = document.getElementById('ptsTotalExpiry');
  if (totalLabelEl) totalLabelEl.textContent = `${d.label} 잔여 포인트`;
  if (pt) {
    if (totalNumEl) totalNumEl.textContent = pt.balance.toLocaleString('ko-KR');
    if (totalExpEl) totalExpEl.textContent = pt.expiry;
  }
  // SVG 재렌더
  const svg = document.getElementById('ptsRepBrc'); if (!svg) return;
  svg.innerHTML = '';
  const W = 200; const bw = W / d.pat.length;
  d.pat.forEach((on, i) => {
    if (!on) return;
    const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
    r.setAttribute('x', i * bw); r.setAttribute('y', 0);
    r.setAttribute('width', bw * .72); r.setAttribute('height', 80);
    r.setAttribute('fill', '#111111');
    svg.appendChild(r);
  });
}

function drawPtsDetBRC() {
  const svg = document.getElementById('ptsDetBrcSvg'); if (!svg) return;
  svg.innerHTML = '';
  const pat = [1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1];
  const W = 260; const bw = W / pat.length;
  pat.forEach((on, i) => {
    if (!on) return;
    const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
    r.setAttribute('x', i * bw); r.setAttribute('y', 0);
    r.setAttribute('width', bw * .72); r.setAttribute('height', 83);
    r.setAttribute('fill', '#111111');
    svg.appendChild(r);
  });
}

function drawPtsRepBRC() {
  const svg = document.getElementById('ptsRepBrc'); if (!svg) return;
  svg.innerHTML = '';
  const pat = [1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,1];
  const W = 200; const bw = W / pat.length;
  pat.forEach((on, i) => {
    if (!on) return;
    const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
    r.setAttribute('x', i * bw); r.setAttribute('y', 0);
    r.setAttribute('width', bw * .72); r.setAttribute('height', 80);
    r.setAttribute('fill', '#111111');
    svg.appendChild(r);
  });
}

function countUpPts() {
  const el = document.getElementById('ptsTotalNum'); if (!el) return;
  const target = 28000; let n = 0;
  const t = setInterval(() => {
    n += 1200;
    el.textContent = n.toLocaleString();
    if (n >= target) { el.textContent = target.toLocaleString(); clearInterval(t); }
  }, 25);
}

/* ── 대표 바코드 편집 바텀시트 ── */

// 연결된 브랜드 Set (초기: 전체)
let _repConnected = null;

function _repBarcodeIcon(extraClass) {
  return `<span class="rep-edit-brand-icon${extraClass ? ' ' + extraClass : ''}">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9V5a2 2 0 0 1 2-2h4"/>
      <path d="M15 3h4a2 2 0 0 1 2 2v4"/>
      <path d="M21 15v4a2 2 0 0 1-2 2h-4"/>
      <path d="M9 21H5a2 2 0 0 1-2-2v-4"/>
      <line x1="7" y1="8" x2="7" y2="16"/>
      <line x1="10.5" y1="8" x2="10.5" y2="16"/>
      <line x1="13" y1="8" x2="13" y2="16"/>
      <line x1="16" y1="8" x2="16" y2="16"/>
    </svg>
  </span>`;
}

function _renderRepEditRow(p, connected) {
  if (connected) {
    return `
      <div class="rep-edit-row" data-id="${p.id}">
        <div class="rep-edit-row-left">
          ${_repBarcodeIcon()}
          <span class="rep-edit-brand-name">${p.name}</span>
        </div>
        <div class="rep-edit-row-right">
          <span class="rep-edit-balance">${p.balance.toLocaleString('ko-KR')}p</span>
          <button class="rep-edit-minus-btn" onclick="toggleRepConnection('${p.id}')" aria-label="${p.name} 제거">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>`;
  } else {
    return `
      <div class="rep-edit-row" data-id="${p.id}">
        <div class="rep-edit-row-left">
          ${_repBarcodeIcon('disconnected')}
          <span class="rep-edit-brand-name disconnected">${p.name}</span>
        </div>
        <div class="rep-edit-row-right">
          <span class="rep-edit-balance disconnected">${p.balance.toLocaleString('ko-KR')}p</span>
          <button class="rep-edit-plus-btn" onclick="toggleRepConnection('${p.id}')" aria-label="${p.name} 추가">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>`;
  }
}

function _renderRepEditList() {
  const list = document.getElementById('repEditList');
  if (!list) return;
  const pts = typeof USE_POINTS !== 'undefined' ? USE_POINTS : [];
  const connected    = pts.filter(p => _repConnected.has(p.id));
  const disconnected = pts.filter(p => !_repConnected.has(p.id));

  let html = connected.map(p => _renderRepEditRow(p, true)).join('');
  if (disconnected.length > 0) {
    html += `<hr class="rep-edit-section-divider">`;
    html += disconnected.map(p => _renderRepEditRow(p, false)).join('');
  }
  list.innerHTML = html;
}

function showRepBrcPopup(e) {
  if (e) e.stopPropagation();
  const overlay = document.getElementById('repEditOverlay');
  if (!overlay) return;

  // 초기화: 전체 연결됨으로
  if (!_repConnected) {
    _repConnected = new Set((typeof USE_POINTS !== 'undefined' ? USE_POINTS : []).map(p => p.id));
  }

  _renderRepEditList();
  overlay.classList.add('open');
}

function hideRepBrcPopup(e) {
  if (e) e.stopPropagation();
  document.getElementById('repEditOverlay')?.classList.remove('open');
}

function toggleRepConnection(id) {
  if (!_repConnected) return;
  if (_repConnected.has(id)) {
    _repConnected.delete(id);
    // 제거된 브랜드가 현재 대표 바코드면 다른 연결된 브랜드로 전환
    const sel = document.getElementById('repBrcSelect');
    if (sel && sel.value === id && _repConnected.size > 0) {
      const nextId = [..._repConnected][0];
      switchRepBarcodeCard(nextId);
      if (sel) sel.value = nextId;
    }
  } else {
    _repConnected.add(id);
  }
  _renderRepEditList();
}

function selectRepBrand(id) {
  switchRepBarcodeCard(id);
  const sel = document.getElementById('repBrcSelect');
  if (sel) sel.value = id;
  setTimeout(() => hideRepBrcPopup(), 180);
}

/* ── 포인트 로고 맵 ── */
const PDET_LOGO_MAP = {
  '네이버':         '로고/네이버포인트.svg',
  '롯데멤버스':     '로고/L포인트.svg',
  'CJ올리브네트웍스':'로고/CJ.svg',
  'SPC그룹':        '로고/해피포인트.svg',
  'GS리테일':       '로고/GS&POINT.svg',
  '신세계그룹':     '로고/신세계.svg',
  '현대백화점':     '로고/H포인트.svg',
  '아성다이소':     '로고/다이소.svg',
  '우아한형제들':   '로고/배민.svg',
  '스타벅스':       '로고/starbucks.svg'
};

function _pdetLogoHtml(issuer, name, size) {
  const src = PDET_LOGO_MAP[issuer] || '';
  const sz = size || 100;
  return src
    ? `<img src="${src}" alt="${name}" style="width:${sz}%;height:${sz}%;object-fit:contain;">`
    : `<span style="font-size:var(--font-size-headline-sm);font-weight:var(--font-weight-bold);color:var(--color-surface);">${(name||issuer||'?').charAt(0)}</span>`;
}

function useHtmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function useTextKey(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, '');
}

function useFirstPlace(value) {
  return String(value || '').split(',')[0].trim();
}

function useCouponBenefitText(cpn) {
  if (!cpn) return '';
  if (cpn.discType === '정률') return `${cpn.benefit}% 할인`;
  return `${Number(cpn.benefit || 0).toLocaleString('ko-KR')}원 혜택`;
}

function usePointCategorySafe(pt) {
  return typeof getPointCategory === 'function' ? getPointCategory(pt) : '';
}

function scorePointForCoupon(pt, cpn) {
  const text = useTextKey([pt.name, pt.issuer, pt.places].join(' '));
  const brand = useTextKey(cpn.brand);
  const place = useTextKey(cpn.place);
  const cat = useTextKey(cpn.cat);
  let score = 0;
  if (brand && text.includes(brand)) score += 8;
  if (place && text.includes(place.slice(0, 4))) score += 4;
  if (cat && text.includes(cat.split('/')[0])) score += 3;
  if (useTextKey(usePointCategorySafe(pt)) && cat.includes(useTextKey(usePointCategorySafe(pt)))) score += 3;
  return score;
}

function scoreCouponForPoint(cpn, pt) {
  const pointText = useTextKey([pt.name, pt.issuer, pt.places].join(' '));
  const couponText = useTextKey([cpn.brand, cpn.name, cpn.cat, cpn.place].join(' '));
  let score = 0;
  if (pointText.includes(useTextKey(cpn.brand)) || couponText.includes(useTextKey(useFirstPlace(pt.places)))) score += 8;
  if (useTextKey(usePointCategorySafe(pt)) && couponText.includes(useTextKey(usePointCategorySafe(pt)))) score += 4;
  return score;
}

function renderCouponDetailRecommendations(cpn) {
  const section = document.querySelector('#p-detail .det-rec-section');
  if (!section || !cpn) return;

  const pointRecs = USE_POINTS
    .map(pt => ({ type: 'point', item: pt, score: scorePointForCoupon(pt, cpn) }))
    .filter(rec => rec.score > 0)
    .sort((a, b) => b.score - a.score || cpnDdayNum(a.item.expiry) - cpnDdayNum(b.item.expiry));

  const couponRecs = USE_COUPONS
    .filter(item => item.id !== cpn.id)
    .map(item => ({
      type: 'coupon',
      item,
      score: (item.cat === cpn.cat ? 5 : 0) + (item.place === cpn.place ? 3 : 0)
    }))
    .filter(rec => rec.score > 0)
    .sort((a, b) => b.score - a.score || cpnDdayNum(a.item.expiry) - cpnDdayNum(b.item.expiry));

  const recs = [...pointRecs.slice(0, 1), ...couponRecs.slice(0, 1)];
  const fallback = couponRecs.concat(pointRecs).filter(rec => !recs.some(sel => sel.item.id === rec.item.id));
  if (!fallback.length) {
    USE_COUPONS
      .filter(item => item.id !== cpn.id)
      .sort((a, b) => cpnDdayNum(a.expiry) - cpnDdayNum(b.expiry))
      .forEach(item => fallback.push({ type: 'coupon', item }));
  }
  while (recs.length < 2 && fallback.length) recs.push(fallback.shift());

  section.innerHTML = `<div class="det-section-title" style="margin-bottom:8px">함께 사용하면 더 좋아요</div>` +
    recs.slice(0, 2).map(rec => {
      if (rec.type === 'point') {
        const pt = rec.item;
        const logo = _pdetLogoHtml(pt.issuer, pt.name, 80);
        return `<div class="det-rec-item" onclick="showPointsDetail('${pt.id}')" style="cursor:pointer">
          <div class="det-rec-img" style="display:flex;align-items:center;justify-content:center;background:var(--color-surface);overflow:hidden">${logo}</div>
          <div class="det-rec-text">
            <div class="det-rec-title">${useHtmlText(pt.name)}</div>
            <div class="det-rec-sub">${Number(pt.balance || 0).toLocaleString('ko-KR')}P 사용 가능 · ${useHtmlText(useFirstPlace(pt.places))}</div>
          </div>
        </div>`;
      }
      const item = rec.item;
      return `<div class="det-rec-item" onclick="ACT['go-detail']&&ACT['go-detail']({target:{dataset:{id:'${item.id}'}}})" style="cursor:pointer">
        <div class="det-rec-img" style="display:flex;align-items:center;justify-content:center;background:${cpnBgColor(item.brand)};color:var(--color-surface);font-weight:var(--font-weight-bold)">${useHtmlText(cpnInitial(item.brand))}</div>
        <div class="det-rec-text">
          <div class="det-rec-title">${useHtmlText(item.brand)} ${useHtmlText(useCouponBenefitText(item))}</div>
          <div class="det-rec-sub">${useHtmlText(item.name)} · ${useHtmlText(cpnDday(item.expiry))}</div>
        </div>
      </div>`;
    }).join('');
}

function renderPointDetailRecommendations(pt) {
  const section = document.querySelector('#p-points-service .pdet-rec-section');
  if (!section || !pt) return;

  const couponRecs = USE_COUPONS
    .map(cpn => ({ type: 'coupon', item: cpn, score: scoreCouponForPoint(cpn, pt) }))
    .filter(rec => rec.score > 0)
    .sort((a, b) => b.score - a.score || cpnDdayNum(a.item.expiry) - cpnDdayNum(b.item.expiry));

  const pointCat = usePointCategorySafe(pt);
  const pointRecs = USE_POINTS
    .filter(item => item.id !== pt.id)
    .map(item => ({
      type: 'point',
      item,
      score: usePointCategorySafe(item) === pointCat ? 4 : 0
    }))
    .filter(rec => rec.score > 0)
    .sort((a, b) => b.score - a.score || cpnDdayNum(a.item.expiry) - cpnDdayNum(b.item.expiry));

  const recs = [...couponRecs.slice(0, 1), ...pointRecs.slice(0, 1)];
  const fallback = couponRecs.concat(pointRecs).filter(rec => !recs.some(sel => sel.item.id === rec.item.id));
  if (!fallback.length) {
    USE_COUPONS
      .sort((a, b) => cpnDdayNum(a.expiry) - cpnDdayNum(b.expiry))
      .forEach(item => fallback.push({ type: 'coupon', item }));
  }
  while (recs.length < 2 && fallback.length) recs.push(fallback.shift());

  section.innerHTML = `<p class="pdet-section-title">함께 사용하면 더 좋아요</p>` +
    recs.slice(0, 2).map(rec => {
      if (rec.type === 'coupon') {
        const cpn = rec.item;
        return `<div class="pdet-rec-item" onclick="ACT['go-detail']&&ACT['go-detail']({target:{dataset:{id:'${cpn.id}'}}})" style="cursor:pointer">
          <div class="pdet-rec-logo-circle" style="background:${cpnBgColor(cpn.brand)};color:var(--color-surface);font-weight:var(--font-weight-bold)">${useHtmlText(cpnInitial(cpn.brand))}</div>
          <div class="pdet-rec-info">
            <p class="pdet-rec-title">${useHtmlText(cpn.brand)} ${useHtmlText(useCouponBenefitText(cpn))}</p>
            <p class="pdet-rec-sub">${useHtmlText(cpn.name)} · ${useHtmlText(cpnDday(cpn.expiry))}</p>
          </div>
        </div>`;
      }
      const item = rec.item;
      return `<div class="pdet-rec-item" onclick="showPointsDetail('${item.id}')" style="cursor:pointer">
        <div class="pdet-rec-logo-circle" style="background:var(--color-surface)">${_pdetLogoHtml(item.issuer, item.name, 80)}</div>
        <div class="pdet-rec-info">
          <p class="pdet-rec-title">${useHtmlText(item.name)}</p>
          <p class="pdet-rec-sub">${Number(item.balance || 0).toLocaleString('ko-KR')}P · ${useHtmlText(useFirstPlace(item.places))}</p>
        </div>
      </div>`;
    }).join('');
}

function showPointsDetail(id) {
  const pt = (typeof USE_POINTS !== 'undefined' ? USE_POINTS : []).find(p => p.id === id);
  if (!pt) return;

  const set = (elId, val) => { const e = document.getElementById(elId); if (e) e.textContent = val; };

  // 브랜드명 + 잔액
  set('ptsDet_brand', pt.name);
  set('ptsDet_bal', pt.balance.toLocaleString('ko-KR'));

  // D-Day 배지
  const dday = cpnDday(pt.expiry);
  const ddayNum = cpnDdayNum(pt.expiry);
  const ddayEl = document.getElementById('ptsDet_dday');
  if (ddayEl) {
    ddayEl.textContent = dday;
    ddayEl.style.background = ddayNum <= 0
      ? 'var(--color-red-400)'
      : ddayNum <= 7
        ? 'var(--color-red-400)'
        : 'var(--color-gray-400)';
  }

  // 소멸 예정: 임박 포인트 (잔액의 20%) + 날짜 포맷 YYYY.MM.DD
  const expiryParts = pt.expiry.split('-');
  const expiryFormatted = expiryParts.length === 3
    ? `${expiryParts[0]}.${expiryParts[1]}.${expiryParts[2]}`
    : pt.expiry.replace(/-/g, '.');
  const expiryPt = Math.floor(pt.balance * 0.2).toLocaleString('ko-KR') + 'P';
  set('ptsDet_expiryDate', expiryFormatted);
  set('ptsDet_expiryPt', expiryPt);

  // 사용처
  const firstPlace = (pt.places || '').split(',')[0].trim() || pt.name + ' 가맹점';
  set('ptsDet_places', firstPlace);

  // 채널 배지
  set('ptsDet_channel', '온·오프라인');

  // 브랜드 로고 (우측 이미지)
  const logoEl = document.getElementById('ptsDet_logo');
  if (logoEl) {
    const logoSrc = PDET_LOGO_MAP[pt.issuer] || '';
    if (logoSrc) {
      logoEl.innerHTML = `<img src="${logoSrc}" alt="${pt.name}">`;
      logoEl.style.background = 'var(--color-gray-50)';
    } else {
      logoEl.innerHTML = `<span style="font-size:var(--font-size-headline-sm);font-weight:var(--font-weight-bold);font-family:var(--font);color:var(--color-surface);">${pt.name.charAt(0)}</span>`;
      logoEl.style.background = pt.logoBg || 'var(--color-gray-400)';
    }
  }

  // 하트 초기화
  const heartEl = document.getElementById('ptsDet_heart');
  if (heartEl) {
    heartEl.classList.remove('on');
    heartEl.querySelector('svg path').setAttribute('fill', 'none');
  }

  // 상세 안내
  set('ptsDet_guide', pt.places
    ? `주요 사용처: ${pt.places}\n\n본 포인트는 유효기간 내 미사용 시 소멸됩니다. 포인트 적립·사용 기준은 각 브랜드 정책에 따릅니다.`
    : '포인트 사용 안내는 각 브랜드 홈페이지를 참조해 주세요.');

  renderPointDetailRecommendations(pt);

  // 주변 매장 리스트 (4개 예시)
  const storeList = document.getElementById('pdetStoreList');
  if (storeList) {
    const storeName = firstPlace;
    const logoInner = logoEl ? logoEl.innerHTML : `<span>${pt.name.charAt(0)}</span>`;
    const logoBg    = logoEl ? logoEl.style.background : 'var(--color-gray-400)';
    const addrs = ['서울 용산구 청파동 203', '서울 마포구 상암동 1601', '서울 강남구 역삼동 737', '서울 서초구 반포동 19'];
    const dists = ['100m', '350m', '800m', '1.2km'];
    storeList.innerHTML = addrs.map((addr, i) => `
      <div class="pdet-store-item">
        <div class="pdet-store-logo" style="background:${logoBg}">${logoInner}</div>
        <div class="pdet-store-info">
          <p class="pdet-store-name">${storeName}</p>
          <p class="pdet-store-addr">${addr}</p>
          <div class="pdet-store-meta">
            <span class="pdet-store-dist">${dists[i]}</span>
            <span class="pdet-store-status">영업중</span>
            <span class="pdet-store-hours">10:00 ~ 22:00</span>
          </div>
        </div>
        <button class="pdet-store-nav-btn" aria-label="길찾기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    `).join('');
  }

  // 아코디언 닫기 초기화
  const acc = document.getElementById('pdetAccordion');
  if (acc) acc.classList.remove('open');

  showAppPage('points-service');
  updateSidebar('');
}

function drawPtsDetBRC() {
  const svg = document.getElementById('ptsDetBrcSvg'); if (!svg) return;
  svg.innerHTML = '';
  const pat = [1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,1,0,0,1,1,0,1];
  const bw = 260 / pat.length;
  pat.forEach((on, i) => {
    if (!on) return;
    const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
    r.setAttribute('x', i * bw); r.setAttribute('y', 0);
    r.setAttribute('width', bw * .7); r.setAttribute('height', 90);
    r.setAttribute('fill', '#111111');
    svg.appendChild(r);
  });
}

function drawQR() {
  const grid = document.getElementById('ptsQrGrid'); if (!grid) return;
  const pat = [
    1,1,1,0,1,0,1,1,1, 1,0,1,0,0,0,1,0,1, 1,0,1,0,1,0,1,0,1,
    1,1,1,0,0,0,1,1,1, 0,0,0,0,1,0,0,0,0, 1,1,1,0,0,0,1,1,1,
    1,0,1,0,1,0,1,0,1, 1,0,1,0,0,0,1,0,1, 1,1,1,0,1,0,1,1,1,
  ];
  grid.innerHTML = '';
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(9,1fr);gap:4px;width:144px;height:144px;margin:0 auto';
  pat.forEach(cell => {
    const d = document.createElement('div');
    d.style.cssText = `background:${cell ? '#111' : 'white'};border-radius:2px`;
    grid.appendChild(d);
  });
}

/* ============================================================ CONNECT ============================================================ */
function runAuthAnimation() {
  const steps = [
    {step:'caStep1', circ:'caCirc1'},
    {step:'caStep2', circ:'caCirc2'},
    {step:'caStep3', circ:'caCirc3'},
  ];
  steps.forEach(s => {
    const st = document.getElementById(s.step);
    const ci = document.getElementById(s.circ);
    if (st) st.className = 'ld-step';
    if (ci) { ci.className = 'step-circ'; ci.textContent = steps.indexOf(s)+1; }
  });
  let delay = 0;
  steps.forEach((s, i) => {
    setTimeout(() => {
      const st = document.getElementById(s.step);
      const ci = document.getElementById(s.circ);
      if (st) st.classList.add('on');
      if (ci) { ci.className = 'step-circ spinning'; ci.textContent = ''; }
    }, delay += 800);
    setTimeout(() => {
      const st = document.getElementById(s.step);
      const ci = document.getElementById(s.circ);
      if (st) { st.classList.remove('on'); st.classList.add('done'); }
      if (ci) { ci.className = 'step-circ done-circ'; ci.textContent = '✓'; }
    }, delay += 700);
  });
  S.authTimer = setTimeout(() => {
    S.authTimer = null;
    const el = document.getElementById('caSuccessCount');
    if (el) { let n=0; const t=setInterval(()=>{ el.textContent=++n; if(n>=12)clearInterval(t); },60); }
    showAppPage('connect-success');
  }, delay + 300);
}

function updateConnectForm() {
  const m = S.connectMethod || 'account';
  ['phone','account','membership'].forEach(method => {
    const el = document.getElementById('cf-'+method);
    if (el) el.style.display = m === method ? 'flex' : 'none';
  });
  const titleEl = document.getElementById('cf-section-title');
  if (titleEl) titleEl.textContent = m === 'membership' ? '멤버십 번호 입력' : '인증 정보 입력';
  const sub = document.getElementById('connectFormSub');
  if (sub) sub.textContent = m === 'membership' ? '멤버십 카드 번호 14자리를 입력해요' : '계정 아이디와 비밀번호로 인증해요';
  // 카드 선택 상태 동기화
  document.querySelectorAll('[data-action="select-manual-method"]').forEach(el => {
    el.classList.toggle('sel', el.dataset.method === m);
  });
}

function setNotiMasterCard(val) {
  // 카드 선택 상태 업데이트
  document.querySelectorAll('.noti-master-card').forEach(c => {
    c.classList.toggle('sel', c.dataset.val === val);
  });
  const settings = document.getElementById('notiSettings');
  const offMsg   = document.getElementById('notiOffMsg');
  if (val === 'yes') {
    if (settings) settings.classList.remove('hidden');
    if (offMsg)   offMsg.style.display = 'none';
  } else {
    if (settings) settings.classList.add('hidden');
    if (offMsg)   offMsg.style.display = 'block';
  }
}

function updateDiscRateRow(checkbox) {
  const row = checkbox.closest('.disc-rate-row');
  if (!row) return;
  const statusEl = row.querySelector('.disc-rate-status');
  if (checkbox.checked) {
    row.classList.add('on');
    if (statusEl) statusEl.textContent = '알림 활성화';
  } else {
    row.classList.remove('on');
    if (statusEl) statusEl.textContent = '알림 비활성화';
  }
}

function showMypageSub(id) {
  const isMobile = window.matchMedia('(max-width:768px)').matches;
  document.querySelectorAll('.mps').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('mps-open');
  });
  // mf-quick-item active 상태 동기화
  const subMap = { noti: 0, connect: 1, info: 2 };
  document.querySelectorAll('#mypageQuickGridFigma .mf-quick-item').forEach((btn, i) => {
    btn.classList.toggle('active', i === subMap[id]);
  });
  const el = document.getElementById('mps-' + id);
  if (el) {
    el.style.display = 'block';
    if (isMobile) {
      el.classList.add('mps-open');
      const bar = document.getElementById('mpsBackBar');
      if (bar) bar.style.display = (id === 'noti' || id === 'connect') ? 'none' : 'flex';
      const titleMap = { noti:'알림 설정', info:'기본 정보', connect:'서비스 연동', profile:'프로필' };
      const titleEl = document.getElementById('mpsBackBarTitle');
      if (titleEl) titleEl.textContent = titleMap[id] || '';
      // 탭바 숨김 (서브페이지 중)
      const tb = document.getElementById('bottomTabBar');
      if (tb) tb.style.display = id === 'connect' ? 'flex' : 'none';
    }
  }
  document.querySelectorAll('[data-action="mypage-tab"]').forEach(t => {
    t.classList.toggle('on', t.dataset.tab === id);
  });
  if (id === 'noti') setTimeout(() => selectNotiCat('mart'), 50);
}
function closeMypageSub() {
  document.querySelectorAll('.mps').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('mps-open');
  });
  // mf-quick-item active 제거
  document.querySelectorAll('#mypageQuickGridFigma .mf-quick-item').forEach(btn => {
    btn.classList.remove('active');
  });
  const bar = document.getElementById('mpsBackBar');
  if (bar) bar.style.display = 'none';
  // 탭바 복구
  const tb = document.getElementById('bottomTabBar');
  if (tb) tb.style.display = '';
}
function highlightMypageMenu(action) {
  document.querySelectorAll('.mypage-menu-item').forEach(el =>
    el.classList.toggle('on', el.dataset.action === action)
  );
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
function togglePtsFilter(type) {
  showToast(type === 'cat' ? '카테고리 필터 (준비중)' : '브랜드 필터 (준비중)');
}
/* ── 신규 온보딩 헬퍼 ── */
function goSocialSignup(title) {
  const el = document.getElementById('socialSignupTitle');
  if (el) el.textContent = title;
  go('signup-social');
}

function toggleTerm2(row) {
  const circle = row.querySelector('.ob2-circle');
  if (!circle) return;
  circle.classList.toggle('on');
  circle.textContent = circle.classList.contains('on') ? '✓' : '';
  // 전체 동의 상태 동기화
  const all = [...document.querySelectorAll('.t2item')];
  const allOn = all.every(c => c.classList.contains('on'));
  const allCircle = document.getElementById('t2All');
  if (allCircle) {
    allCircle.classList.toggle('on', allOn);
    allCircle.textContent = allOn ? '✓' : '';
  }
}

function toggleAllTerms2() {
  const allCircle = document.getElementById('t2All');
  if (!allCircle) return;
  const nowOn = !allCircle.classList.contains('on');
  allCircle.classList.toggle('on', nowOn);
  allCircle.textContent = nowOn ? '✓' : '';
  document.querySelectorAll('.t2item').forEach(c => {
    c.classList.toggle('on', nowOn);
    c.textContent = nowOn ? '✓' : '';
  });
}

let _spTimerInt = null;
function sendSignupOTP() {
  const btn = document.getElementById('spSendBtn');
  if (btn) { btn.classList.add('active'); btn.textContent = '발송완료'; }
  let sec = 55;
  const timerEl = document.getElementById('spTimer');
  clearInterval(_spTimerInt);
  _spTimerInt = setInterval(() => {
    if (sec <= 0) { clearInterval(_spTimerInt); if(timerEl) timerEl.textContent = '시간 만료'; return; }
    if (timerEl) timerEl.textContent = `${--sec}초 ⏱`;
  }, 1000);
}

function toggleNearbySort(e) {
  e.stopPropagation();
  document.getElementById('nmapSortWrap').classList.toggle('open');
}
function selectNearbySort(label, el) {
  document.getElementById('nmapSortLabel').textContent = label;
  document.querySelectorAll('.nmap-sort-item').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('nmapSortWrap').classList.remove('open');
}
document.addEventListener('click', () => {
  document.getElementById('nmapSortWrap')?.classList.remove('open');
  document.querySelectorAll('.wsh-sort-wrap').forEach(w => w.classList.remove('open'));
});

/* ── 즐겨찾기 브랜드/쿠폰 탭 ── */
const WSH_POINTS = [
  { id:'happypoint', name:'해피포인트',        amount:'4,150p',  exp:'2026-06-30', dnum:30,  urgent:true,  logo:'로고/happypoint.svg' },
  { id:'baemin',     name:'배민포인트',         amount:'3,000p',  exp:'2026-07-31', dnum:60,  urgent:true,  logo:'로고/baemin.svg' },
  { id:'cjone',      name:'CJ ONE 포인트',     amount:'3,200p',  exp:'2026-09-30', dnum:127, urgent:false, logo:'' },
  { id:'naverpay',   name:'네이버페이 포인트',  amount:'12,500p', exp:'2026-12-31', dnum:214, urgent:false, logo:'' },
  { id:'lpoint',     name:'엘포인트 (L.POINT)',amount:'5,400p',  exp:'2027-05-15', dnum:350, urgent:false, logo:'' },
];

function wshPtCard(p) {
  const dnum = cpnDdayNum(p.exp);
  const isDday = dnum <= 1;
  const isD30 = dnum >= 2 && dnum <= 30;
  const isUrgent = isDday || isD30;

  const m = String(p.amount).match(/^([\d,]+)\s*(p)?$/i);
  const amountVal = m ? m[1] : p.amount;
  const amountUnit = m && m[2] ? 'P' : '';

  const heartSvg = `<svg width="16" height="17" viewBox="0 0 24 24" fill="var(--color-red-400)" stroke="var(--color-red-400)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  const logoStyle = !p.urgent && p.logoBg ? ` style="background:${p.logoBg}"` : '';
  const logoHtml = p.logo
    ? `<img src="${p.logo}" alt="" style="width: 100%; height: 100%; object-fit: contain;">`
    : `<span class="wsh-pt-logo-fallback" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:var(--color-gray-200);color:var(--color-gray-600);border-radius:50%;font-weight:700;">${p.name.charAt(0)}</span>`;

  if (isUrgent) {
    const ddayClass = isD30 ? ' wsh-pt-dday-d30' : '';
    const logoBlock = `
          <div class="wsh-pt-logo-wrap">
            <div class="wsh-pt-logo"${logoStyle}>${logoHtml}</div>
          </div>`;
    const infoHtml = `
        <div class="wsh-pt-info">
          <div class="wsh-pt-info-head">
            <span class="wsh-pt-brand">${p.name}</span>
            <span class="wsh-pt-heart">${heartSvg}</span>
          </div>
          ${wshPtAmountHtml(p.amount)}
          <p class="wsh-pt-expiry">만료기한 ${p.exp}</p>
        </div>`;

    return `
    <div class="wsh-pt-card urgent">
      <div class="wsh-pt-card-inner">
        <div class="wsh-pt-card-content">
          ${logoBlock}
          ${infoHtml}
        </div>
      </div>
      <div class="wsh-pt-dday${ddayClass}">D-${dnum <= 0 ? 'Day' : dnum}</div>
    </div>`;
  }

  // General Card
  const generalHeartSvg = `<svg width="16" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-900)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

  return `
  <div style="width: 100%; height: 100%; overflow: hidden; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: inline-flex; margin-bottom: var(--spacing-12);">
      <div style="align-self: stretch; padding: var(--spacing-16); background: var(--color-gray-50); overflow: hidden; border-radius: var(--radius-xl); outline: 2px solid var(--color-blue-200); outline-offset: -2px; flex-direction: column; justify-content: center; align-items: flex-start; display: flex">
          <div style="align-self: stretch; padding-top: var(--spacing-4); padding-bottom: var(--spacing-4); overflow: hidden; justify-content: flex-start; align-items: flex-end; gap: var(--spacing-16); display: inline-flex">
              <div style="width: 80px; height: 86px; justify-content: flex-start; align-items: center; gap: var(--spacing-10); display: flex">
                  <div style="width: 64px; height: 64px; border-radius: var(--radius-full); border: 2px solid var(--color-on-primary); overflow: hidden; display: flex; justify-content: center; align-items: center; background: var(--color-on-primary);">
                      ${logoHtml}
                  </div>
              </div>
              <div style="flex: 1 1 0; height: 86px; flex-direction: column; justify-content: center; align-items: flex-start; gap: var(--spacing-8); display: inline-flex">
                  <div style="align-self: stretch; height: 20px; justify-content: space-between; align-items: flex-start; display: inline-flex">
                      <div style="color: var(--color-gray-900); font-size: var(--font-size-caption); font-family: var(--font); font-weight: var(--font-weight-bold); word-wrap: break-word">${p.name}</div>
                      <div style="width: 16px; height: 17px; position: relative">
                          <div style="width: 16px; height: 17px; left: 0px; top: 0px; position: absolute; overflow: hidden; display: flex; justify-content: center; align-items: center;">
                              ${generalHeartSvg}
                          </div>
                      </div>
                  </div>
                  <div style="align-self: stretch; color: var(--color-gray-900); font-size: var(--font-size-headline-md); font-family: var(--font); font-weight: var(--font-weight-bold); word-wrap: break-word">${p.amount}</div>
                  <div style="align-self: stretch; color: var(--color-gray-900); font-size: var(--font-size-caption); font-family: var(--font); font-weight: var(--font-weight-medium); word-wrap: break-word">만료기한 ${p.exp}</div>
              </div>
          </div>
      </div>
  </div>`;
}

function wshRenderPoints(sortVal) {
  const list = document.getElementById('wshPtList');
  if (!list) return;
  
  if (!sortVal) {
    const labelEl = document.getElementById('wshPtSortLabel');
    sortVal = labelEl ? labelEl.textContent.trim() : '마감임박순';
  }

  let sortedPoints = [...WSH_POINTS];
  
  // 현재 선택된 카테고리 칩에 따른 필터링 (포인트 전용 매핑)
  if (_wshActiveCategory && _wshActiveCategory !== '전체') {
    sortedPoints = sortedPoints.filter(p => {
      if (p.name.includes('배민') && _wshActiveCategory === '배달') return true;
      if (p.name.includes('해피') && _wshActiveCategory === '카페') return true;
      if (p.name.includes('L.POINT') && (_wshActiveCategory === '마트' || _wshActiveCategory === '편의점')) return true;
      if (p.name.includes('CJ') && _wshActiveCategory === '뷰티') return true;
      if (p.name.includes('네이버') && _wshActiveCategory === '기타') return true;
      return false;
    });
  }
  
  if (sortVal === '최대할인순' || sortVal === '포인트많은순' || sortVal === '금액순') {
    sortedPoints.sort((a, b) => {
      const valA = parseInt(String(a.amount).replace(/[^0-9]/g, '')) || 0;
      const valB = parseInt(String(b.amount).replace(/[^0-9]/g, '')) || 0;
      return valB - valA;
    });
  } else if (sortVal === '이름순') {
    sortedPoints.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortVal === '인기순') {
    // 인기순은 기본 정렬(원본 배열 순서)을 유지하거나 마감임박순으로 대체
  } else {
    // 마감임박순 (기본)
    sortedPoints.sort((a, b) => cpnDdayNum(a.exp) - cpnDdayNum(b.exp));
  }

  let html = '';
  sortedPoints.forEach(p => { html += wshPtCard(p); });
  list.innerHTML = html;
}

const WSH_BRANDS = {
  starbucks: { id:'starbucks', name:'스타벅스', icon:'스', bg:'#00704A', cat:'카페', hasPoint:true, point:'3,200p',
    coupons:[
      { title:'아메리카노 교환권', cond:'없음', start:'2026.03.01', exp:'2026.06.30', dday:'D-35', urgent:false },
      { title:'조각케이크+커피 세트권', cond:'지정 세트 메뉴 변경 불가', start:'2026.05.01', exp:'2027.05.19', dday:'D-357', urgent:false },
    ]},
  emart: { id:'emart', name:'이마트', icon:'이', bg:'#E8440A', cat:'마트', hasPoint:true, point:'5,100p',
    coupons:[
      { title:'e머니 5천점 적립 쿠폰', cond:'7만원 이상 결제 및 포인트 적립 시', start:'2026.05.01', exp:'2026.08.31', dday:'D-96', urgent:false },
      { title:'마트 직송 8천원 할인쿠폰', cond:'8만원 이상 주문 시 사용 가능', start:'2026.05.01', exp:'2026.07.31', dday:'D-66', urgent:false },
    ]},
  baemin: { id:'baemin', name:'배달의민족', icon:'배', bg:'#2AC1BC', cat:'배달', hasPoint:false,
    coupons:[
      { title:'가게배달 중복 15% 쿠폰', cond:'해당 쿠폰 마크 부착 매장 주문 시', start:'2026.05.01', exp:'2026.06.30', dday:'D-35', urgent:false },
      { title:'사이드메뉴 무료증정 쿠폰', cond:'치킨 메인 메뉴 1마리 이상 주문 시', start:'2026.05.01', exp:'2027.05.19', dday:'D-357', urgent:false },
    ]},
  homeplus: { id:'homeplus', name:'홈플러스', icon:'홈', bg:'#007DC3', cat:'마트', hasPoint:true, point:'2,800p',
    coupons:[
      { title:'모바일 금액상품권 1만원권', cond:'서비스 품목(담배/택배 등) 제외', start:'2026.05.01', exp:'2027.05.19', dday:'D-357', urgent:false },
      { title:'쓱배송 10% 점포할인 쿠폰', cond:'쓱배송 및 새벽배송 상품 적용', start:'2026.05.01', exp:'2026.09.30', dday:'D-127', urgent:false },
    ]},
  gs25: { id:'gs25', name:'GS25', icon:'G', bg:'#0066B3', cat:'편의점', hasPoint:true, point:'1,500p',
    coupons:[
      { title:'연세우유 크림빵 500원 할인', cond:'연세우유 디저트 시리즈 전체', start:'2026.05.01', exp:'2026.11.30', dday:'D-188', urgent:false },
      { title:'모바일 금액권 5천원권', cond:'타 결제 수단과 복합결제 가능', start:'2026.05.01', exp:'2026.06.30', dday:'D-35', urgent:false },
    ]},
  oliveyoung: { id:'oliveyoung', name:'올리브영', icon:'올', bg:'#00B050', cat:'뷰티', hasPoint:true, point:'4,300p',
    coupons:[
      { title:'기프트카드 5만원 충전권', cond:'없음', start:'2026.05.01', exp:'2026.09.30', dday:'D-127', urgent:false },
    ]},
};
let _wshSortTarget = 'coupon';

function toggleWshSort(id, e) {
  if (e) e.stopPropagation();
  _wshSortTarget = id === 'wshPtSortWrap' ? 'point' : 'coupon';
  document.querySelectorAll('.wsh-sort-wrap').forEach(w => w.classList.remove('open'));
  openWshSortBottomSheet();
}

function selectWshSort(wrapId, labelId, label, el) {
  _wshSortTarget = wrapId === 'wshPtSortWrap' ? 'point' : 'coupon';
  selectBottomSheetSort(label);
}

function openWshSortBottomSheet() {
  const sheet = document.getElementById('wshSortBottomSheet');
  const content = document.getElementById('wshSortBottomSheetContent');
  if (!sheet || !content) return;

  document.querySelectorAll('.wsh-sort-option-item').forEach(item => {
    const group = item.getAttribute('data-group') || '';
    item.style.display = group.includes(_wshSortTarget) ? 'flex' : 'none';
  });

  const sortBtn = document.querySelector(_wshSortTarget === 'point' ? '#wshPtSortWrap .wsh-cpn-sort-btn' : '#wshCpnSortWrap .wsh-cpn-sort-btn');
  const arrow = sortBtn?.querySelector('svg');
  if (arrow) arrow.style.transform = 'rotate(180deg)';

  const labelId = _wshSortTarget === 'point' ? 'wshPtSortLabel' : 'wshCpnSortLabel';
  const currentSortText = document.getElementById(labelId)?.textContent?.trim() || '마감임박순';
  updateBottomSheetIcons(currentSortText);

  sheet.style.display = 'flex';
  requestAnimationFrame(() => {
    content.style.transform = 'translateY(0)';
  });
}

function closeWshSortBottomSheet() {
  const sheet = document.getElementById('wshSortBottomSheet');
  const content = document.getElementById('wshSortBottomSheetContent');
  if (!sheet || !content) return;
  content.style.transform = 'translateY(100%)';
  document.querySelectorAll('.wsh-cpn-sort-btn svg').forEach(arrow => {
    arrow.style.transform = '';
  });
  setTimeout(() => {
    sheet.style.display = 'none';
  }, 250);
}

function selectBottomSheetSort(val) {
  const labelId = _wshSortTarget === 'point' ? 'wshPtSortLabel' : 'wshCpnSortLabel';
  const labelEl = document.getElementById(labelId);
  if (labelEl) labelEl.textContent = val;

  const wrapId = _wshSortTarget === 'point' ? 'wshPtSortWrap' : 'wshCpnSortWrap';
  document.querySelectorAll('#' + wrapId + ' .nmap-sort-item').forEach(item => {
    item.classList.toggle('active', item.textContent.trim() === val);
  });

  updateBottomSheetIcons(val);
  closeWshSortBottomSheet();

  if (_wshSortTarget === 'point') {
    wshRenderPoints(val);
  } else {
    renderWishlist();
  }
}

function updateBottomSheetIcons(activeVal) {
  document.querySelectorAll('.wsh-sort-option-item').forEach(item => {
    const isActive = item.getAttribute('data-value') === activeVal;
    const textEl = item.querySelector('.wsh-sort-option-text');
    const iconEl = item.querySelector('.wsh-sort-check-icon');
    if (textEl) textEl.style.color = isActive ? 'var(--color-blue-500)' : 'var(--color-gray-500)';
    if (iconEl) iconEl.style.display = isActive ? 'flex' : 'none';
  });
}
function wshCpnCard(b, c) {
  const dateLabel = c.exp ? c.exp + ' 까지' : '';
  const channelLabel = c.ch || '온라인';
  const heartSvg = `<svg width="16" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  return `<div style="border-top:1px solid var(--color-gray-100)">
    <div style="background:white;padding:var(--spacing-16);display:flex;flex-direction:column;gap:9px;min-height:128px;cursor:pointer" data-action="go-detail" data-id="${b.id}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <span style="font-size:var(--font-size-caption);font-weight:var(--font-weight-medium);color:var(--color-gray-700);font-family:var(--font)">${b.name}</span>
        <span style="display:flex;align-items:center;line-height:1">${heartSvg}</span>
      </div>
      <div style="display:flex;gap:var(--spacing-16);height:72px;align-items:center">
        <div style="display:inline-grid;grid-template-columns:max-content;grid-template-rows:max-content;place-items:start;flex-shrink:0">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--color-gray-100);margin-top:var(--spacing-4);grid-column:1;grid-row:1"></div>
          <span style="grid-column:1;grid-row:1;margin-top:0;margin-left:32px;background:var(--color-blue-200);padding:var(--spacing-4) var(--spacing-10);border-radius:var(--radius-full);font-size:var(--font-size-caption);font-weight:var(--font-weight-semi-bold);color:var(--color-gray-700);white-space:nowrap;font-family:var(--font)">${channelLabel}</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:var(--spacing-6);min-width:0;justify-content:center;height:100%">
          <p style="font-size:var(--font-size-body);font-weight:var(--font-weight-bold);color:var(--color-gray-700);font-family:var(--font)">${c.title}</p>
          <p style="font-size:var(--font-size-caption);font-weight:var(--font-weight-medium);color:var(--color-gray-700);font-family:var(--font)">${c.cond}</p>
          <p style="font-size:var(--font-size-caption);font-weight:var(--font-weight-medium);color:var(--color-gray-700);font-family:var(--font)">${dateLabel}</p>
        </div>
      </div>
    </div>
  </div>`;
}
let _wshEditMode = false;
let _wshCouponEditMode = false;
let _wshCurrentBrandId = null;

function wshToggleEditMode() {
  _wshEditMode = !_wshEditMode;
  const grid = document.getElementById('wshBrandGrid');
  const btn  = document.getElementById('wshEditBtn');
  if (_wshEditMode) {
    grid.classList.add('wsh-edit-mode');
    btn.textContent = '완료';
    btn.style.color = 'var(--primary)';
    btn.style.fontWeight = '800';
  } else {
    // 완료: 삭제 표시된 셀 제거
    grid.querySelectorAll('.wsh-brand-cell.wsh-mark-delete').forEach(el => {
      el.style.transition = 'opacity 0.18s, transform 0.18s';
      el.style.opacity = '0';
      el.style.transform = 'scale(0.4)';
      setTimeout(() => el.remove(), 180);
    });
    grid.classList.remove('wsh-edit-mode');
    btn.textContent = '편집 | 삭제';
    btn.style.color = 'var(--gray-700)';
    btn.style.fontWeight = '700';
  }
}

function wshMarkDelete(btn, e) {
  e.stopPropagation();
  const cell = btn.closest('.wsh-brand-cell');
  cell.classList.toggle('wsh-mark-delete');
}

function wshEnsureCouponDeleteButtons() {
  document.querySelectorAll('#wshCpnList .wsh-cpn-card').forEach(function(card) {
    if (card.querySelector('.wsh-cpn-del-btn')) return;
    const brand = (card.querySelector('.wsh-cpn-brand-lbl')?.textContent || '쿠폰').trim();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wsh-cpn-del-btn';
    btn.setAttribute('aria-label', brand + ' 쿠폰 삭제');
    btn.textContent = '−';
    btn.onclick = function(e) { wshMarkCouponDelete(this, e); };
    card.prepend(btn);
  });
}

function wshToggleCouponEditMode() {
  const list = document.getElementById('wshCpnList');
  const btn = document.getElementById('wshCpnEditBtn');
  if (!list || !btn) return;
  _wshCouponEditMode = !_wshCouponEditMode;
  if (_wshCouponEditMode) {
    wshEnsureCouponDeleteButtons();
    list.classList.add('wsh-edit-mode');
    btn.textContent = '완료';
    btn.style.color = 'var(--primary)';
    btn.style.fontWeight = '800';
  } else {
    list.querySelectorAll('.wsh-cpn-card.wsh-mark-delete').forEach(function(el) {
      el.style.transition = 'opacity 0.18s, transform 0.18s';
      el.style.opacity = '0';
      el.style.transform = 'scale(0.4)';
      setTimeout(function() { el.remove(); }, 180);
    });
    list.classList.remove('wsh-edit-mode');
    btn.textContent = '편집 | 삭제';
    btn.style.color = 'var(--gray-700)';
    btn.style.fontWeight = '700';
  }
}

function wshMarkCouponDelete(btn, e) {
  e.stopPropagation();
  const card = btn.closest('.wsh-cpn-card');
  if (!card) return;
  card.classList.toggle('wsh-mark-delete');
}

function wshOpenBrand(id) {
  // [핵심] 진입 시점에 바코드 아코디언 카드 무조건 닫힘(초기화) 상태로 강제 전환
  const pointAccordion = document.getElementById('wshDetailPointSection');
  if (pointAccordion) {
    pointAccordion.classList.remove('is-expanded');
  }

  const chevron = document.querySelector('.wsh-barcode-chevron');
  if (chevron) {
    chevron.style.transform = 'rotate(0deg)';
  }

  _wshCurrentBrandId = id;
  const b = WSH_BRANDS[id]; if (!b) return;
  // 헤더 타이틀을 브랜드명으로
  const titleEl = document.getElementById('wshHeaderTitle');
  if (titleEl) titleEl.textContent = b.name;
  // 칩바 숨김
  const chipBar = document.getElementById('wshChipBar');
  if (chipBar) chipBar.style.display = 'none';
  // 히어로 원형 업데이트
  const circle = document.getElementById('wshDetailCircle');
  if (circle) {
    const logoSrc = typeof BRAND_LOGO !== 'undefined' ? BRAND_LOGO[b.name] : null;
    if (logoSrc) {
      circle.style.background = 'white';
      circle.style.color = 'transparent';
      circle.style.overflow = 'hidden';
      circle.innerHTML = `<img src="${logoSrc}" alt="${b.name}" style="width:100%; height:100%; object-fit:contain; border-radius:50%;">`;
    } else {
      circle.style.background = 'white';
      circle.style.color = b.bg;
      circle.textContent = b.icon;
    }
  }
  // 포인트 섹션 표시 여부 및 데이터 매핑
  const ptSection = document.getElementById('wshDetailPointSection');
  if (ptSection) {
    if (b.hasPoint) {
      ptSection.style.display = 'flex';
      const ptBrand = document.getElementById('wshPtAccBrand');
      const ptAmount = document.getElementById('wshPtAccAmount');
      if (ptBrand) ptBrand.textContent = b.name;
      if (ptAmount) ptAmount.textContent = b.point || '0p';
    } else {
      ptSection.style.display = 'none';
    }
  }
  // 쿠폰 섹션 표시
  const cpnSection = document.getElementById('wshDetailCouponSection');
  if (cpnSection) {
    cpnSection.style.display = b.coupons && b.coupons.length ? 'flex' : 'none';
  }
  // 쿠폰 카드 렌더링 (첫 번째 쿠폰은 디데이 티켓 디자인으로 강조)
  document.getElementById('wshDetailCoupons').innerHTML = b.coupons.map((c, idx) => {
    return idx === 0 ? wshDetailDdayCardItem(b, c) : wshCpnCardItem(b, c, true);
  }).join('');
  // 그리드 → 상세 전환
  document.getElementById('wshBrandGrid').style.display = 'none';
  document.getElementById('wshGridBar').style.display = 'none';
  document.getElementById('wshBrandDetail').style.display = 'flex';
  const sa = document.getElementById('wshScrollArea');
  if (sa) sa.scrollTop = 0;
}
function wshShowBrandGrid() {
  document.getElementById('wshBrandGrid').style.display = 'grid';
  document.getElementById('wshGridBar').style.display = 'flex';
  document.getElementById('wshBrandDetail').style.display = 'none';
  // 편집 모드 강제 종료
  if (_wshEditMode) {
    _wshEditMode = false;
    document.getElementById('wshBrandGrid').classList.remove('wsh-edit-mode');
    const btn = document.getElementById('wshEditBtn');
    if (btn) { btn.textContent = '편집 | 삭제'; btn.style.color = 'var(--gray-700)'; btn.style.fontWeight = '700'; }
  }
  // 헤더 타이틀 복원
  const titleEl = document.getElementById('wshHeaderTitle');
  if (titleEl) titleEl.textContent = '즐겨찾기';
  // 칩바 복원
  const chipBar = document.getElementById('wshChipBar');
  if (chipBar) chipBar.style.display = 'flex';
  const sa = document.getElementById('wshScrollArea');
  if (sa) sa.scrollTop = 0;
}
function wshCpnCardItem(b, c, isDetail = false) {
  const dateStr = c.exp ? c.exp.replace(/\./g, '-') + ' 까지' : '';
  const logoSrc = BRAND_LOGO[b.name];
  const logoInner = logoSrc
    ? `<img src="${logoSrc}" alt="${b.name}" style="width:100%; height:100%; object-fit:contain; border-radius:var(--radius-full);">`
    : cpnInitial(b.name);
  const logoBg = logoSrc ? 'white' : cpnBgColor(b.name);
  const logoStyle = `background:${logoBg}; display:flex; align-items:center; justify-content:center; font-weight:var(--font-weight-heavy);`;

  const favSvg = `<svg width="16" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>`;
  
  const heartHtml = isDetail ? '' : `<span class="wsh-cpn-heart" onclick="toggleCpnFav('${b.id}', this)">${favSvg}</span>`;

  return `<div class="wsh-cpn-card wsh-normal-horizontal" data-action="go-detail" data-id="${b.id}">
    <button type="button" class="wsh-cpn-del-btn" onclick="wshMarkCouponDelete(this,event)" aria-label="${b.name} 쿠폰 삭제">−</button>
    <div class="wsh-nh-header">
      <span class="wsh-nh-brand">${b.name}</span>
      ${heartHtml}
    </div>
    <div class="wsh-nh-body">
      <div class="wsh-cpn-logo-wrap">
        <div class="wsh-cpn-logo-circle" style="${logoStyle}">${logoInner}</div>
        <span class="wsh-cpn-badge">온라인</span>
      </div>
      <div class="wsh-nh-info">
        <div class="wsh-nh-title">${c.title}</div>
        <div class="wsh-nh-cond">${c.cond}</div>
        <div class="wsh-nh-date">${dateStr}</div>
      </div>
    </div>
  </div>`;
}

function wshDetailDdayCardItem(b, c) {
  const dateStr = c.exp ? c.exp.replace(/\./g, '-') + ' 까지' : '';
  const logoSrc = BRAND_LOGO[b.name];
  const logoInner = logoSrc
    ? `<img src="${logoSrc}" alt="${b.name}" style="width:100%; height:100%; object-fit:contain;">`
    : cpnInitial(b.name);
  const logoBg = logoSrc ? 'white' : cpnBgColor(b.name);

  return `<div class="wsh-cpn-card wsh-dday-ticket" data-action="go-detail" data-id="${b.id}" style="position: relative; overflow: hidden;" onclick="ACT['go-detail']&&ACT['go-detail']({target:this})">
  <div class="wsh-dday-inner" style="width: 100%; height: 100%; display: flex; flex-direction: column;">
    <div class="wsh-dday-content" style="display: flex; flex-direction: column; flex: 1;">
      
      <div class="wsh-dday-head" style="display: flex; justify-content: space-between; align-items: center;">
        <span class="wsh-cpn-brand-lbl">${b.name}</span>
      </div>
      
      <div class="wsh-dday-body" style="display: flex; align-items: center; gap: 16px; margin-top: 8px;">
        <div class="wsh-cpn-logo-wrap" style="position: relative; flex-shrink: 0;">
          <div class="wsh-cpn-logo-circle" style="background:${logoBg}; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius: var(--radius-full); font-weight:var(--font-weight-heavy); color:white;">
            ${logoInner}
          </div>
          <span class="wsh-cpn-badge">오프라인</span>
        </div>
        
        <div class="wsh-cpn-info" style="display: flex; flex-direction: column; gap: 2px;">
          <p class="wsh-cpn-title" style="margin:0; font-weight:700;">${c.title}</p>
          <p class="wsh-cpn-cond" style="margin:0; color:var(--color-gray-400);">${c.cond}</p>
          <p class="wsh-cpn-date" style="margin:0; color:var(--color-gray-400);">${dateStr}</p>
        </div>
      </div>

    </div>
  </div>
  <div class="wsh-dday-badge filled">D-DAY</div>
</div>`;
}

function wshRenderCouponList() {
  const list = document.getElementById('wshCpnList');
  if (!list) return;
  const cards = [];
  Object.values(WSH_BRANDS).forEach(b => {
    b.coupons.forEach(c => cards.push(wshCpnCardItem(b, c)));
  });
  list.innerHTML = cards.join('');
  if (_wshCouponEditMode) {
    list.classList.add('wsh-edit-mode');
  }
}

function wshShowTab(tab) {
  const isBrand  = tab === 'brand';
  const isCoupon = tab === 'coupon';
  const isPoints = tab === 'points';
  document.getElementById('wshTabBrand')?.classList.toggle('on', isBrand);
  document.getElementById('wshTabCoupon')?.classList.toggle('on', isCoupon);
  document.getElementById('wshTabPoints')?.classList.toggle('on', isPoints);
  document.getElementById('wshBrandSection').style.display  = isBrand  ? 'block' : 'none';
  document.getElementById('wshCouponSection').style.display = isCoupon ? 'block' : 'none';
  document.getElementById('wshPointSection').style.display  = isPoints ? 'block' : 'none';
  // 칩바: 항상 표시하되 브랜드 상세 페이지가 켜져 있는 상태는 wshShowBrandGrid/wshOpenBrand에서 개별 제어
  const chipBar = document.getElementById('wshChipBar');
  if (chipBar) chipBar.style.display = 'flex';
  if (isBrand) {
    if (_wshCouponEditMode) wshToggleCouponEditMode();
    wshShowBrandGrid();
  } else if (isCoupon) {
    renderWishlist();
  } else if (isPoints) {
    wshRenderPoints();
  }
}

/* ════════════════════════════════════════
   음성 검색
════════════════════════════════════════ */
let _vsRecog = null;
let _vsMuted = false;

function openVoiceSearch() {
  const modal = document.getElementById('voiceSearchModal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('vsTranscript').style.display = 'none';
  document.getElementById('vsTranscript').textContent = '';
  document.getElementById('vsError').style.display = 'none';
  document.getElementById('vsMainText').textContent = '‘치킨’ 이라고 말해보세요.';
  document.getElementById('vsMainText').style.whiteSpace = '';
  // 파동 애니메이션 시작
  ['vsRing1','vsRing2','vsRing3'].forEach((id,i) => {
    const el = document.getElementById(id);
    el.style.setProperty('--base-op', ['0.07','0.13','0.22'][i]);
    el.classList.add('vs-ring-active');
    el.style.animationDelay = `${i * 0.3}s`;
  });
  startVoiceRecognition();
}

function closeVoiceSearch() {
  const modal = document.getElementById('voiceSearchModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  stopVoiceRecognition();
  ['vsRing1','vsRing2','vsRing3'].forEach(id => document.getElementById(id).classList.remove('vs-ring-active'));
}

function toggleVoiceVolume() {
  _vsMuted = !_vsMuted;
}

function startVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('vsError').textContent = '이 브라우저는 음성 인식을 지원하지 않아요.';
    document.getElementById('vsError').style.display = 'block';
    return;
  }
  _vsRecog = new SpeechRecognition();
  _vsRecog.lang = 'ko-KR';
  _vsRecog.continuous = false;
  _vsRecog.interimResults = true;
  _vsRecog.maxAlternatives = 1;

  _vsRecog.onstart = () => {
    document.getElementById('vsMainText').textContent = '듣고 있어요.';
    document.getElementById('vsTranscript').style.display = 'block';
  };

  _vsRecog.onresult = (e) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t;
      else interim += t;
    }
    document.getElementById('vsTranscript').textContent = final || interim;
    if (final) {
      document.getElementById('vsMainText').textContent = '검색하고 있어요.';
      setTimeout(() => {
        closeVoiceSearch();
        // 검색 시트 열고 검색어 입력
        openHomeSearchSheet();
        const inp = document.getElementById('homeSearchSheetInput');
        if (inp) { inp.value = final; searchHomeSheetCoupons(final); }
      }, 600);
    }
  };

  _vsRecog.onerror = (e) => {
    const msgs = { 'no-speech':'말씀이 인식되지 않았어요. 다시 시도해주세요.', 'not-allowed':'마이크 권한이 필요해요.', 'network':'네트워크 오류가 발생했어요.' };
    document.getElementById('vsError').textContent = msgs[e.error] || '오류가 발생했어요. 다시 시도해주세요.';
    document.getElementById('vsError').style.display = 'block';
    document.getElementById('vsMainText').textContent = '‘치킨’ 이라고 말해보세요.';
  };

  _vsRecog.onend = () => {
    const txt = document.getElementById('vsTranscript').textContent;
    if (!txt) document.getElementById('vsMainText').textContent = '‘치킨’ 이라고 말해보세요.';
  };

  try { _vsRecog.start(); } catch(e) {}
}

function getNearbyCouponDetailId(store, key) {
  if (store?.cpnId) return store.cpnId;
  if (store?.detailId) return store.detailId;
  const brand = store?.key || key || '';
  const coupon = USE_COUPONS.find(c => c.brand === brand);
  if (coupon) return coupon.id;
  const couponIdByReadableKey = {
    CU: 'CP-016',
    GS25: 'CP-015',
    BHC: 'CP-021',
    BBQ: 'CP-020',
    CGV: 'CP-023',
    ZARA: 'CP-010'
  };
  return couponIdByReadableKey[key] || couponIdByReadableKey[brand] || brand.toLowerCase();
}

function getNearbyPointDetailId(store, key) {
  if (store?.pointDetailId) return store.pointDetailId;
  if (store?.pointId) return store.pointId;
  if (store?.ptsId) return store.ptsId;

  const text = [key, store?.key, store?.name, store?.disc, store?.pointRate]
    .filter(Boolean)
    .join(' ');
  const pointIdRules = [
    [/GS25|GS/, 'PT-005'],
    [/스타벅스|리워드|STARBUCKS/i, 'PT-010'],
    [/배민|배달/, 'PT-009'],
    [/이마트|신세계|SSG/i, 'PT-006'],
    [/CU|CJ/i, 'PT-003'],
    [/해피|SPC|파리/i, 'PT-004'],
    [/롯데|엘포인트|L\.?POINT/i, 'PT-002'],
    [/다이소/, 'PT-008'],
    [/현대|H\.?Point/i, 'PT-007'],
    [/네이버|NAVER/i, 'PT-001']
  ];
  const matched = pointIdRules.find(([pattern]) => pattern.test(text));
  return matched ? matched[1] : 'PT-005';
}

function nbsUse(key) {
  const store = NEARBY_STORES.find(s => s.key === key);
  if (!store) return;

  closeNearbySheet();

  if (getMapPinType(store) === 'point') {
    const pointId = getNearbyPointDetailId(store, key);
    if (pointId && typeof showPointsDetail === 'function') showPointsDetail(pointId);
    return;
  }

  const detailId = getNearbyCouponDetailId(store, key);
  if (detailId && ACT['go-detail']) {
    ACT['go-detail']({ target: { dataset: { id: detailId } } });
  }
}

/* Coupon search clear behavior */
function updatePhCouponSearchClear(query) {
  const clearBtn = document.querySelector('#p-points-hub #ph-cpn .ph-search-clear-btn');
  if (!clearBtn) return;
  clearBtn.classList.toggle('is-visible', Boolean((query || '').trim()));
}

function clearPhCouponSearch(btn) {
  const wrap = btn?.closest('.ph-search-wrap');
  const input = wrap?.querySelector('.ph-search-input') || document.querySelector('#p-points-hub #ph-cpn .ph-search-input');
  if (!input) return;
  input.value = '';
  filterPhCouponsBySearch('');
  input.focus();
}

function filterPhCouponsBySearch(keyword) {
  const list = document.getElementById('phCpnList');
  if (!list) return;
  const query = (keyword || '').trim().toLowerCase();
  updatePhCouponSearchClear(query);
  const cards = Array.from(list.querySelectorAll('.ph-cpn-card'));
  let visibleCount = 0;

  cards.forEach(card => {
    const searchText = [
      card.dataset.id,
      card.dataset.cat,
      card.querySelector('.ph-cpn-brand')?.textContent,
      card.querySelector('.ph-cpn-title')?.textContent,
      card.querySelector('.ph-cpn-cond')?.textContent,
      card.querySelector('.ph-cpn-date')?.textContent,
      card.querySelector('.ph-chip-cat')?.textContent,
      card.querySelector('.ph-ch-badge')?.textContent
    ].filter(Boolean).join(' ').toLowerCase();
    const matched = !query || searchText.includes(query);
    card.style.display = matched ? '' : 'none';
    if (matched) visibleCount += 1;
  });

  list.querySelectorAll('.ph-cpn-divider').forEach(divider => {
    divider.style.display = query ? 'none' : '';
  });

  const countLabel = document.getElementById('phCpnCountLabel');
  if (countLabel) {
    countLabel.textContent = query ? `검색 결과 ${visibleCount}장` : `보유 쿠폰 ${visibleCount}장`;
  }
}

function stopVoiceRecognition() {
  try { if (_vsRecog) { _vsRecog.stop(); _vsRecog = null; } } catch(e) {}
}

/* ════════════════════════════════════════
   이미지 검색
════════════════════════════════════════ */
let _isStream = null;

function openImageSearch() {
  const modal = document.getElementById('imageSearchModal');
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  // 카메라 시작
  startCamera();
}

function closeImageSearch() {
  document.getElementById('imageSearchModal').style.display = 'none';
  stopCamera();
  // 미리보기 초기화
  document.getElementById('isImgPreview').style.display = 'none';
  document.getElementById('isImgPreview').src = '';
  document.getElementById('isVideo').style.display = 'none';
  document.getElementById('isPreviewArea').style.display = 'flex';
  document.getElementById('isResultThumb').innerHTML = '';
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    _isStream = stream;
    const video = document.getElementById('isVideo');
    video.srcObject = stream;
    video.style.display = 'block';
    document.getElementById('isPreviewArea').style.display = 'none';
  } catch(e) {
    // 권한 거부 등 → 갤러리 첨부 유도
    document.getElementById('isPreviewArea').innerHTML = '<div style="text-align:center;color:var(--gray-500);padding:20px"><div style="font-size:36px;margin-bottom:10px">📷</div><div style="font-size:var(--font-size-body);font-weight:var(--font-weight-medium)">카메라 권한이 필요해요<br>아래 갤러리에서 사진을 선택해주세요</div></div>';
  }
}

function stopCamera() {
  if (_isStream) { _isStream.getTracks().forEach(t => t.stop()); _isStream = null; }
}

function captureImage() {
  const video = document.getElementById('isVideo');
  if (!video.srcObject) { openGallery(); return; }
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg');
  showImagePreview(dataUrl, '촬영 이미지');
}

function openGallery() {
  document.getElementById('isFileInput').click();
}

function handleImageFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => showImagePreview(e.target.result, file.name.replace(/\.[^.]+$/, ''));
  reader.readAsDataURL(file);
}

function showImagePreview(src, name) {
  // 카메라 숨기고 이미지 표시
  document.getElementById('isVideo').style.display = 'none';
  document.getElementById('isPreviewArea').style.display = 'none';
  const img = document.getElementById('isImgPreview');
  img.src = src; img.style.display = 'block';
  // 결과 카드 업데이트
  const thumb = document.getElementById('isResultThumb');
  thumb.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  document.getElementById('isResultLabel').textContent = '인식된 상품';
  document.getElementById('isResultName').textContent = name || '이미지 검색';
  stopCamera();
}

/* ── 티켓 카드 테두리 순환 빛 애니메이션 ──
   SVG stroke-dashoffset: 단일 path가 카드 테두리를 시계 방향으로 순환
   ─────────────────────────────────────────── */
function initTicketBorderAnim() {
  const svgNS = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('#phTicketCarousel .ph-cpn-card.ticket').forEach(card => {
    if (card.querySelector('.ticket-border-svg')) return; // 중복 삽입 방지
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'ticket-border-svg');
    svg.setAttribute('aria-hidden', 'true');
    // rect: 카드 크기에 100% 맞춤 — x/y 없으면 0,0이 기본
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('class', 'ticket-border-path');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('rx', '14'); // 카드 border-radius(16px)에서 1.5px border 두께 제외
    svg.appendChild(rect);
    card.appendChild(svg);
  });
}
// DOM 로드 후 주입, 이미 렌더된 정적 HTML에 바로 적용
document.addEventListener('DOMContentLoaded', () => {
  initTicketBorderAnim();
});

/* Voice search modal - Figma 526:3900 final behavior */
function openVoiceSearch() {
  const modal = document.getElementById('voiceSearchModal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('vsTranscript').style.display = 'none';
  document.getElementById('vsTranscript').textContent = '';
  document.getElementById('vsError').style.display = 'none';
  document.getElementById('vsMainText').textContent = '원하는 혜택을 말해보세요.';
  document.getElementById('vsMainText').style.whiteSpace = '';
  ['vsRing1','vsRing2','vsRing3'].forEach((id,i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.setProperty('--base-op', ['0.07','0.13','0.22'][i]);
    el.classList.add('vs-ring-active');
    el.style.animationDelay = `${i * 0.3}s`;
  });
  startVoiceRecognition();
}

function closeVoiceSearch() {
  const modal = document.getElementById('voiceSearchModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  stopVoiceRecognition();
  ['vsRing1','vsRing2','vsRing3'].forEach(id => document.getElementById(id)?.classList.remove('vs-ring-active'));
}

function startVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('vsError').textContent = '이 브라우저는 음성 인식을 지원하지 않아요.';
    document.getElementById('vsError').style.display = 'block';
    return;
  }
  _vsRecog = new SpeechRecognition();
  _vsRecog.lang = 'ko-KR';
  _vsRecog.continuous = false;
  _vsRecog.interimResults = true;
  _vsRecog.maxAlternatives = 1;

  _vsRecog.onstart = () => {
    document.getElementById('vsMainText').textContent = '듣고 있어요.';
    document.getElementById('vsTranscript').style.display = 'block';
  };

  _vsRecog.onresult = (e) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t;
      else interim += t;
    }
    document.getElementById('vsTranscript').textContent = final || interim;
    if (final) {
      document.getElementById('vsMainText').textContent = '검색하고 있어요.';
      setTimeout(() => {
        closeVoiceSearch();
        openHomeSearchSheet();
        const inp = document.getElementById('homeSearchSheetInput');
        if (inp) { inp.value = final; searchHomeSheetCoupons(final); }
      }, 600);
    }
  };

  _vsRecog.onerror = (e) => {
    const msgs = {
      'no-speech': '말을 인식하지 못했어요. 다시 시도해주세요.',
      'not-allowed': '마이크 권한이 필요해요.',
      'network': '네트워크 오류가 발생했어요.'
    };
    document.getElementById('vsError').textContent = msgs[e.error] || '오류가 발생했어요. 다시 시도해주세요.';
    document.getElementById('vsError').style.display = 'block';
    document.getElementById('vsMainText').textContent = '원하는 혜택을 말해보세요.';
  };

  _vsRecog.onend = () => {
    const txt = document.getElementById('vsTranscript').textContent;
    if (!txt) document.getElementById('vsMainText').textContent = '원하는 혜택을 말해보세요.';
  };

  try { _vsRecog.start(); } catch(e) {}
}
