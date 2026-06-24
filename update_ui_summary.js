
const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '배달', 'deploy', 'index.html');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const newLines = [];
let insideDriverView = false;
let insertedSummary = false;
let insideListArea = false;

const driverViewMarker = "{view === 'driver' && (";
const spaceY4Marker = 'className="space-y-4"'; // Relaxed marker
const listAreaMarker = 'className="space-y-6"'; // Relaxed marker
const carouselMarker = 'className="relative group"'; // Relaxed marker

const summaryHtml = `
                                {/* ===== TOP SUMMARY (FIXED ORDER) ===== */} 
                                <div className="pb-3"> 
                                
                                  {/* 1. 공지사항 */} 
                                  <div className="mx-3 mt-3 text-xs text-slate-500"> 
                                    📢 오늘은 비 오는 지역 배송 주의 
                                  </div> 
                                
                                  {/* 2. 날짜 */} 
                                  <div className="mx-3 mt-3 rounded-2xl bg-white border shadow-sm 
                                                  px-4 py-3 flex items-center justify-between"> 
                                    <span className="text-sm font-semibold"> 
                                      {targetDate} 
                                    </span> 
                                    <button className="text-lg">📅</button> 
                                  </div> 
                                
                                  {/* 3. 비용 합계 (심플) */} 
                                  <div className="mx-3 mt-3 rounded-2xl bg-white border shadow-sm 
                                                  px-4 py-3"> 
                                    <p className="text-xs text-slate-500">비용 합계</p> 
                                    <p className="text-xl font-bold mt-1">{totalInstallFeeOnly.toLocaleString()}원</p> 
                                  </div> 
                                
                                  {/* 4. 오늘 배송 현황 */} 
                                  <div className="mx-3 mt-4 rounded-2xl bg-white border shadow-sm 
                                                  px-4 py-3 flex items-center justify-between"> 
                                
                                    <div> 
                                      <p className="text-sm font-bold">🚦 오늘 배송 현황</p> 
                                      <p className="text-xs text-slate-500 mt-1"> 
                                        완료 {deliveries.filter(d => d.date === targetDate && d.driver === currentUser && d.status === '완료').length}건 · 취소 {deliveries.filter(d => d.date === targetDate && d.driver === currentUser && d.canceled).length}건 
                                      </p> 
                                    </div> 
                                
                                    <button 
                                      onClick={() => setShowMap(!showMap)}
                                      className="px-4 py-2 rounded-xl 
                                                 bg-indigo-600 text-white 
                                                 text-sm font-bold"> 
                                      {showMap ? '지도 닫기' : '지도 보기'} 
                                    </button> 
                                  </div> 
                                
                                  {/* 5. 배송 목록 */} 
                                  <div className="mx-3 mt-4 mb-3 rounded-2xl bg-white border shadow-sm 
                                                  px-4 py-3 flex items-center justify-between"> 
                                
                                    <div> 
                                        {!isMergeMode ? (
                                            <>
                                                <p className="text-sm font-bold">📦 배송 목록</p> 
                                                <p className="text-xs text-slate-500 mt-1"> 
                                                    미완료 {sortedDeliveries.length}건 
                                                </p> 
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-bold text-indigo-700">합칠 배송지를 선택하세요</p> 
                                                <p className="text-xs text-indigo-500 mt-1">{selectedMergeIds.length}건 선택됨</p> 
                                            </>
                                        )}
                                    </div> 
                                
                                    <div className="flex items-center gap-2"> 
                                      <button 
                                        onClick={toggleMergeMode}
                                        className={\`px-3 py-1.5 rounded-full text-xs font-medium 
                                            \${isMergeMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}\`}> 
                                        {isMergeMode ? '취소' : '합치기'} 
                                      </button> 
                                
                                      {isMergeMode && (
                                        <button 
                                            disabled={selectedMergeIds.length < 2} 
                                            onClick={handleMergeDeliveries} 
                                            className={\`px-3 py-1.5 rounded-lg text-xs font-bold \${selectedMergeIds.length < 2 ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white'}\`}>
                                            하나로 ({selectedMergeIds.length})
                                        </button>
                                      )}

                                      {!isMergeMode && (
                                        <button 
                                            onClick={() => setView('driver_add')}
                                            className="w-10 h-10 rounded-full 
                                                       bg-indigo-600 text-white 
                                                       text-xl flex items-center justify-center"> 
                                            + 
                                        </button> 
                                      )}
                                    </div> 
                                  </div> 
                                
                                </div>
`;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes(driverViewMarker)) {
        insideDriverView = true;
        console.log(`Found Driver View at line ${i}`);
        newLines.push(line);
        continue;
    }

    if (insideDriverView && line.includes(spaceY4Marker) && !insertedSummary) {
        console.log(`Found space-y-4 at line ${i} - Inserting Summary`);
        newLines.push(line);
        newLines.push(summaryHtml);
        insertedSummary = true;
        continue;
    }

    if (insideDriverView && line.includes(listAreaMarker)) {
        insideListArea = true;
        console.log(`Found List Area at line ${i}`);
        newLines.push(line);
        continue;
    }

    if (insideListArea) {
        if (line.includes(carouselMarker)) {
            insideListArea = false;
            console.log(`Found Carousel at line ${i} - End Deletion`);
            newLines.push(line);
        } else {
            // Skip lines (delete)
        }
        continue;
    }

    newLines.push(line);
}

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Finished processing.');
