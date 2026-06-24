const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '배달', 'deploy', 'index.html');

const recoveryCode = `
                                            <div className="bg-slate-50 p-8 rounded-xl border-2 border-dashed border-slate-300 text-center">
                                                <p className="text-slate-500 mb-2">이미지 파일을 이곳에 드래그하거나 클릭하여 업로드하세요</p>
                                                <button className="bg-white px-4 py-2 rounded border border-slate-300 text-sm font-bold text-slate-600 hover:bg-slate-50">파일 선택</button>
                                            </div>
                                        </div>
                                    )}

                                    {editTab === 'history' && (
                                        <div className="space-y-4">
                                            <p className="text-center text-slate-400 py-8">수정 이력이 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Footer */}
                                <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                                    <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold">닫기</button>
                                    <button onClick={() => {
                                        // Save logic
                                        const updated = deliveries.map(d => d.id === editTarget.id ? editTarget : d);
                                        setDeliveries(updated);
                                        StorageManager.saveDeliveries(updated);
                                        setShowEditModal(false);
                                        alert('수정되었습니다.');
                                    }} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200">저장하기</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
</script>
</body>
</html>
`;

fs.appendFileSync(filePath, recoveryCode, 'utf8');
console.log("Recovered truncated file.");
