const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '배달', 'deploy', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// New UI Content
const newUI = `{/* ===== TOP SUMMARY (FIXED ORDER) ===== */}
                                <div className="space-y-3 pb-3">

                                  {/* 1. 공지사항 */}
                                  <div className="mx-3 mt-3 text-xs text-slate-500">
                                    📢 오늘은 비 오는 지역 배송 주의
                                  </div>

                                  {/* 2. 날짜 */}
                                  <div className="mx-3 mt-3 rounded-2xl bg-white border shadow-sm px-4 py-3 flex items-center justify-between">
                                    <span className="text-sm font-semibold">
                                      {targetDate}
                                    </span>
                                    <button className="text-lg">📅</button>
                                  </div>

                                  {/* 3. 비용 합계 */}
                                  <div className="mx-3 mt-3 rounded-2xl bg-white border shadow-sm px-4 py-3">
                                    <p className="text-xs text-slate-500">비용 합계</p>
                                    <p className="text-xl font-bold mt-1">{(totalInstallFeeOnly || 0).toLocaleString()}원</p>
                                  </div>

                                  {/* 4. 오늘 배송 현황 */}
                                  <div className="mx-3 mt-3 rounded-2xl bg-white border shadow-sm px-4 py-3 flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-bold">🚦 오늘 배송 현황</p>
                                      <p className="text-xs text-slate-500 mt-1">
                                        완료 {deliveries ? deliveries.filter(d => d.date === targetDate && d.driver === currentUser && d.status === '완료').length : 0}건 · 취소 {deliveries ? deliveries.filter(d => d.date === targetDate && d.driver === currentUser && d.canceled).length : 0}건
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => setShowMap(!showMap)}
                                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold">
                                      {showMap ? '지도 닫기' : '지도'}
                                    </button>
                                  </div>

                                  {/* 5. 배송 목록 */}
                                  <div className="mx-3 mt-3 rounded-2xl bg-white border shadow-sm px-4 py-3 flex items-center justify-between">
                                    <div>
                                      {!isMergeMode ? (
                                          <>
                                            <p className="text-sm font-bold">📦 배송 목록</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                미완료 {(sortedDeliveries || []).length}건
                                            </p>
                                          </>
                                      ) : (
                                          <>
                                            <p className="text-sm font-bold text-indigo-700">합칠 배송지를 선택하세요</p>
                                            <p className="text-xs text-indigo-500 mt-1">{(selectedMergeIds || []).length}건 선택됨</p>
                                          </>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={toggleMergeMode}
                                        className={\`px-3 py-1.5 rounded-full text-xs font-medium \${isMergeMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}\`}>
                                        {isMergeMode ? '취소' : '합치기'}
                                      </button>

                                      {isMergeMode && (
                                        <button
                                            disabled={!selectedMergeIds || selectedMergeIds.length < 2}
                                            onClick={handleMergeDeliveries}
                                            className={\`px-3 py-1.5 rounded-lg text-xs font-bold \${selectedMergeIds && selectedMergeIds.length >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}\`}>
                                            하나로 ({selectedMergeIds ? selectedMergeIds.length : 0})
                                        </button>
                                      )}

                                      {!isMergeMode && (
                                        <button
                                            onClick={() => setView('driver_add')}
                                            className="w-10 h-10 rounded-full bg-indigo-600 text-white text-xl flex items-center justify-center">
                                            +
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                </div>`;

// Replace Logic
const startMarker = "{/* ===== TOP SUMMARY (FIXED ORDER) ===== */}";
const endMarker = "{/* 지도 영역: Active 목록 상위 30개만 표시 (성능 최적화) */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    
    // Check if there are extra closing divs in the old content that we need to preserve?
    // The old content was inside <div className="space-y-4"> and had its own container <div className="pb-3">
    // The new content also has <div className="space-y-3 pb-3"> (I changed class slightly as requested by "top-wrap")
    // Wait, "top-wrap" -> space-y-3 pb-3.
    // I should make sure I don't accidentally remove the closing div of "space-y-4" if it was included in the range?
    // No, "space-y-4" wraps the whole section.
    // The previous summary block ended with </div> (line 5006).
    // And then line 5010 starts the map.
    // So replacing everything between startMarker and endMarker should be fine, AS LONG AS I include the necessary newlines.
    
    const newContent = before + newUI + "\n\n\n                                " + after;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Successfully updated Top Summary UI.");
} else {
    console.error("Could not find start or end markers.");
}
