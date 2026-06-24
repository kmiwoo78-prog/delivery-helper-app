
const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '배달', 'deploy', 'index.html');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{/* 합치기 버튼 영역 */}')) {
        startIdx = i;
        break;
    }
}

if (startIdx !== -1) {
    console.log(`Found start at line ${startIdx + 1}`);
    
    let endIdx = -1;
    for (let i = startIdx; i < lines.length; i++) {
        if (lines[i].includes('Sortable List Container')) {
            endIdx = i - 1;
            while (endIdx > startIdx && lines[endIdx].trim() === '') endIdx--; 
            break;
        }
    }
    
    if (endIdx !== -1) {
        console.log(`Found end at line ${endIdx + 1}`);
        
        const newContent = `                                {/* 합치기 / 배송 목록 카드 */}
                                <div 
                                    className=" 
                                        mx-3 mt-4 
                                        rounded-2xl bg-white 
                                        shadow-sm border 
                                        px-4 py-3 min-h-[92px] 
                                        flex items-center justify-between 
                                    " 
                                > 
                                    {/* 좌측 텍스트 영역 */} 
                                    <div className="flex flex-col justify-center gap-1"> 
                                        {!isMergeMode ? (
                                            <>
                                                <p className="text-sm font-bold text-slate-900 leading-tight"> 
                                                    📦 배송 목록 
                                                </p> 
                                                <p className="text-xs text-slate-500 leading-tight"> 
                                                    오늘 예약된 배송 {sortedDeliveries.length}건 
                                                </p> 
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-bold text-indigo-700 leading-tight"> 
                                                    합칠 배송지를 선택하세요 
                                                </p> 
                                                <p className="text-xs text-indigo-500 leading-tight"> 
                                                    {selectedMergeIds.length}건 선택됨 
                                                </p> 
                                            </>
                                        )}
                                    </div> 

                                    {/* 우측 액션 버튼 영역 */} 
                                    <div className="flex items-center gap-2 flex-shrink-0"> 
                                        {/* 합치기 / 취소 버튼 */}
                                        <button 
                                            onClick={toggleMergeMode} 
                                            className={\`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap 
                                                \${isMergeMode 
                                                    ? 'bg-slate-800 text-white' 
                                                    : 'bg-slate-100 text-slate-600'} 
                                            \`} 
                                        > 
                                            {isMergeMode ? '취소' : '합치기'} 
                                        </button> 

                                        {/* 합치기 실행 버튼 (합치기 모드일 때만) */}
                                        {isMergeMode && (
                                            <button 
                                                disabled={selectedMergeIds.length < 2} 
                                                onClick={handleMergeDeliveries} 
                                                className={\`px-3 py-1.5 rounded-xl text-xs font-bold 
                                                    \${selectedMergeIds.length < 2 
                                                        ? 'bg-slate-200 text-slate-400' 
                                                        : 'bg-indigo-600 text-white'} 
                                                \`} 
                                            > 
                                                하나로 ({selectedMergeIds.length})
                                            </button> 
                                        )}

                                        {/* 배송지 추가 (일반 모드일 때만) */}
                                        {!isMergeMode && (
                                            <button 
                                                onClick={() => setView('driver_add')} 
                                                className=" 
                                                    w-10 h-10 
                                                    rounded-full 
                                                    bg-indigo-600 text-white 
                                                    text-xl leading-none 
                                                    flex items-center justify-center 
                                                    flex-shrink-0 
                                                " 
                                                aria-label="배송지 추가" 
                                            > 
                                                + 
                                            </button> 
                                        )}
                                    </div> 
                                </div>`;
        
        lines.splice(startIdx, endIdx - startIdx + 1, newContent);
        
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log('Successfully updated index.html');
    } else {
        console.log('End tag not found');
    }
} else {
    console.log('Start tag not found');
}
