const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '배달', 'deploy', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const markerTopSummary = "{/* ===== TOP SUMMARY (FIXED ORDER) ===== */}";
const markerMap = "{/* 지도 영역: Active 목록 상위 30개만 표시 (성능 최적화) */}";
const markerMainEnd = "</main>";

const idxTopSummary = content.indexOf(markerTopSummary);
const idxMap = content.indexOf(markerMap);
const idxMainEnd = content.indexOf(markerMainEnd);

if (idxTopSummary === -1 || idxMap === -1 || idxMainEnd === -1) {
    console.error("Markers not found!");
    process.exit(1);
}

// Part 1: Admin Section (up to Top Summary)
// We assume 3 divs are open: grid, col-span-12, space-y-4. And the view condition.
let part1 = content.substring(0, idxTopSummary);
// Close the open divs and the admin view
part1 += `
                                        </div>
                                    </div>
                                </div>
                            )}
`;

// Part 2: Driver Section (Top Summary)
// We use the new UI structure
const topSummaryHTML = `
                            {/* ===== TOP SUMMARY (DRIVER ONLY) ===== */}
                            {view === 'driver' && (
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

                                </div>
                            )}
`;

// Part 3: Shared Section (Map, List, Sync)
// We take the content from markerMap to markerMainEnd
let mapListContent = content.substring(idxMap, idxMainEnd);

// Remove the last ')}' (closing admin view)
const lastBraceIdx = mapListContent.lastIndexOf(')}');
if (lastBraceIdx !== -1) {
    // Remove the brace
    mapListContent = mapListContent.substring(0, lastBraceIdx) + mapListContent.substring(lastBraceIdx + 2);
}

// Remove the last '</div>' (closing admin tools wrapper) if present
const lastDivIdx = mapListContent.lastIndexOf('</div>');
if (lastDivIdx !== -1) {
    // Check if it's near the end (ignoring whitespace)
    const afterDiv = mapListContent.substring(lastDivIdx + 6).trim();
    if (afterDiv === '') {
         mapListContent = mapListContent.substring(0, lastDivIdx);
    }
}

const sharedSection = `
                            {/* ===== SHARED (Admin & Driver) ===== */}
                            {(view === 'admin' || view === 'driver') && (
                                <>
${mapListContent}
                                </>
                            )}
`;

// Part 4: Rest of the file
const rest = content.substring(idxMainEnd);

// Combine
const newContent = part1 + topSummaryHTML + sharedSection + rest;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully restructured main view.");
