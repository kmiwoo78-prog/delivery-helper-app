const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '배달', 'deploy', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject CSS
const cssToAdd = `
 <style> 
 body { 
   background:#f4f6f8; 
   margin:0; 
   font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
 } 
 
 .top-wrap { 
   padding-bottom:12px; 
 } 
 
 .notice { 
   font-size:12px; 
   color:#64748b; 
   margin:12px; 
 } 
 
 .card { 
   background:#fff; 
   border-radius:16px; 
   margin:12px; 
   padding:14px 16px; 
   box-shadow:0 1px 3px rgba(0,0,0,.06); 
 } 
 
 .row { 
   display:flex; 
   align-items:center; 
   justify-content:space-between; 
 } 
 
 .label { 
   font-size:12px; 
   color:#64748b; 
 } 
 
 .value { 
   font-size:20px; 
   font-weight:700; 
   margin-top:4px; 
 } 
 
 .sub { 
   font-size:12px; 
   color:#64748b; 
   margin-top:4px; 
 } 
 
 .btn-primary { 
   background:#4f46e5; 
   color:#fff; 
   border:none; 
   padding:8px 14px; 
   border-radius:12px; 
 } 
 
 .btn-ghost { 
   background:#f1f5f9; 
   border:none; 
   padding:6px 12px; 
   border-radius:999px; 
   font-size:12px; 
 } 
 
 .btn-add { 
   background:#4f46e5; 
   color:#fff; 
   border:none; 
   width:40px; 
   height:40px; 
   border-radius:50%; 
   font-size:22px; 
   margin-left:8px; 
 } 
 
 .actions { 
   display:flex; 
   align-items:center; 
 } 
 </style>
`;

if (!content.includes('.top-wrap')) {
    const headEndIndex = content.indexOf('</head>');
    if (headEndIndex !== -1) {
        content = content.substring(0, headEndIndex) + cssToAdd + content.substring(headEndIndex);
        console.log("CSS injected.");
    } else {
        console.error("Could not find </head> tag.");
    }
} else {
    console.log("CSS already present or similar classes found.");
}

// 2. Replace Top Summary with User's HTML + React Data
const newUI = `{/* ===== TOP SUMMARY (FIXED ORDER) ===== */}
                                <div className="top-wrap">

                                  {/* 1. 공지사항 */}
                                  <div className="notice">
                                    📢 오늘은 비 오는 지역 배송 주의
                                  </div>

                                  {/* 2. 날짜 */}
                                  <div className="card row">
                                    <strong className="text-sm font-semibold">
                                      {targetDate}
                                    </strong>
                                    <span className="text-lg">📅</span>
                                  </div>

                                  {/* 3. 비용 합계 */}
                                  <div className="card">
                                    <div className="label">비용 합계</div>
                                    <div className="value">{(totalInstallFeeOnly || 0).toLocaleString()}원</div>
                                  </div>

                                  {/* 4. 오늘 배송 현황 */}
                                  <div className="card row">
                                    <div>
                                      <strong className="text-sm font-bold">🚦 오늘 배송 현황</strong>
                                      <div className="sub">
                                        완료 {deliveries ? deliveries.filter(d => d.date === targetDate && d.driver === currentUser && d.status === '완료').length : 0}건 · 취소 {deliveries ? deliveries.filter(d => d.date === targetDate && d.driver === currentUser && d.canceled).length : 0}건
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => setShowMap(!showMap)}
                                      className="btn-primary">
                                      {showMap ? '지도 닫기' : '지도'}
                                    </button>
                                  </div>

                                  {/* 5. 배송 목록 */}
                                  <div className="card row">
                                    <div>
                                      {!isMergeMode ? (
                                          <>
                                            <strong className="text-sm font-bold">📦 배송 목록</strong>
                                            <div className="sub">
                                                미완료 {(sortedDeliveries || []).length}건
                                            </div>
                                          </>
                                      ) : (
                                          <>
                                            <strong className="text-sm font-bold text-indigo-700">합칠 배송지를 선택하세요</strong>
                                            <div className="sub">{(selectedMergeIds || []).length}건 선택됨</div>
                                          </>
                                      )}
                                    </div>

                                    <div className="actions">
                                      <button
                                        onClick={toggleMergeMode}
                                        className="btn-ghost">
                                        {isMergeMode ? '취소' : '합치기'}
                                      </button>

                                      {isMergeMode && (
                                        <button
                                            disabled={!selectedMergeIds || selectedMergeIds.length < 2}
                                            onClick={handleMergeDeliveries}
                                            className="btn-ghost"
                                            style={{ marginLeft: '8px', background: selectedMergeIds && selectedMergeIds.length >= 2 ? '#4f46e5' : '#e2e8f0', color: selectedMergeIds && selectedMergeIds.length >= 2 ? '#fff' : '#94a3b8' }}>
                                            하나로 ({selectedMergeIds ? selectedMergeIds.length : 0})
                                        </button>
                                      )}

                                      {!isMergeMode && (
                                        <button
                                            onClick={() => setView('driver_add')}
                                            className="btn-add">
                                            +
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                </div>`;

const startMarker = "{/* ===== TOP SUMMARY (FIXED ORDER) ===== */}";
const endMarker = "{/* 지도 영역: Active 목록 상위 30개만 표시 (성능 최적화) */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    
    const newContent = before + newUI + "\n\n\n                                " + after;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Successfully updated Top Summary UI with user's CSS classes.");
} else {
    console.error("Could not find start or end markers for UI update.");
}
