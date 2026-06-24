
import os

file_path = r'd:\배달\deploy\index.html'
log_path = r'd:\배달\deploy\debug_replace.txt'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = 4866 # Line 4867 (1-based)
end_idx = 4913   # Line 4913 (1-based), so slice up to 4913 includes 4912

line_start = lines[start_idx]
line_end = lines[end_idx-1] # Line 4913 (1-based) is index 4912

with open(log_path, 'w', encoding='utf-8') as log:
    log.write(f"Start line ({start_idx+1}): {line_start}")
    log.write(f"End line ({end_idx}): {line_end}")

    if "합치기 버튼 영역" in line_start and "</div>" in line_end:
        log.write("Context matches. Proceeding with replacement.\n")
        
        new_content = """                                {/* 합치기 / 배송 목록 카드 */}
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
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap 
                                                ${isMergeMode 
                                                    ? 'bg-slate-800 text-white' 
                                                    : 'bg-slate-100 text-slate-600'} 
                                            `} 
                                        > 
                                            {isMergeMode ? '취소' : '합치기'} 
                                        </button> 

                                        {/* 합치기 실행 버튼 (합치기 모드일 때만) */}
                                        {isMergeMode && (
                                            <button 
                                                disabled={selectedMergeIds.length < 2} 
                                                onClick={handleMergeDeliveries} 
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold 
                                                    ${selectedMergeIds.length < 2 
                                                        ? 'bg-slate-200 text-slate-400' 
                                                        : 'bg-indigo-600 text-white'} 
                                                `} 
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
                                </div>
"""
        # Replace the range
        lines[start_idx:end_idx] = [new_content + "\n"]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
            
        log.write("Replacement done.")
    else:
        log.write("Context MISMATCH. Aborting.")

