  
  export default function Pagination2({ page, setPage, totalPages }) {
 return(<>
   {totalPages > 1 && (
                      <div className="mt-4! flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="rounded-lg border border-emerald-200 bg-white px-3! py-1.5! text-xs font-bold text-emerald-700 transition hover:border-sky-400 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          قبلی
                        </button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let p: number;
                            if (totalPages <= 5) p = i + 1;
                            else if (page <= 3) p = i + 1;
                            else if (page >= totalPages - 2)
                              p = totalPages - 4 + i;
                            else p = page - 2 + i;

                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                                  page === p
                                    ? "bg-linear-to-tr from-emerald-500 to-sky-500 text-white shadow-md shadow-emerald-500/30"
                                    : "border border-emerald-200 bg-white text-emerald-700 hover:border-sky-400 hover:text-sky-600"
                                }`}
                              >
                                {p}
                              </button>
                            );
                          },
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={page === totalPages}
                          className="rounded-lg border border-emerald-200 bg-white px-3! py-1.5! text-xs font-bold text-emerald-700 transition hover:border-sky-400 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          بعدی
                        </button>
                      </div>
                    )}
 </>)
  }