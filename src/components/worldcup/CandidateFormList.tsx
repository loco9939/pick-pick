import React from 'react';

interface Candidate {
    name: string;
    url: string;
    [key: string]: any; // Allow other properties like id
}

interface CandidateFormListProps {
    candidates: Candidate[];
    selectedRound: number;
    onCandidateChange: (index: number, field: 'name' | 'url', value: string) => void;
    onPreviewImage: (url: string) => void;
}

export default function CandidateFormList({
    candidates,
    selectedRound,
    onCandidateChange,
    onPreviewImage,
}: CandidateFormListProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Candidates ({candidates.filter(c => c.name && c.url).length} / {selectedRound})
                </label>
            </div>

            {/* Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {candidates.map((candidate, index) => (
                    <div key={index} className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
                        {/* Left: Image */}
                        <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded-md border bg-muted">
                            <div className="absolute top-0 left-0 z-10 bg-black/60 px-2 py-0.5 text-xs text-white rounded-br-md">
                                #{index + 1}
                            </div>
                            {candidate.url ? (
                                <img
                                    src={candidate.url}
                                    alt={candidate.name}
                                    className="h-full w-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => onPreviewImage(candidate.url)}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                    No Img
                                </div>
                            )}
                        </div>

                        {/* Right: Inputs */}
                        <div className="flex flex-1 flex-col justify-center space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Name</label>
                                <input
                                    value={candidate.name}
                                    onChange={(e) => onCandidateChange(index, 'name', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Candidate Name"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Image URL</label>
                                <input
                                    value={candidate.url}
                                    onChange={(e) => onCandidateChange(index, 'url', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Image URL (https://...)"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden rounded-md border md:block overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[50px]">#</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[150px]">Candidate Name</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[200px]">Image URL</th>
                            <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[100px]">Preview</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {candidates.map((candidate, index) => (
                            <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle text-muted-foreground">
                                    {index + 1}
                                </td>
                                <td className="p-4 align-middle">
                                    <input
                                        value={candidate.name}
                                        onChange={(e) => onCandidateChange(index, 'name', e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Candidate Name"
                                    />
                                </td>
                                <td className="p-4 align-middle">
                                    <input
                                        value={candidate.url}
                                        onChange={(e) => onCandidateChange(index, 'url', e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </td>
                                <td className="p-4 align-middle text-center">
                                    {candidate.url ? (
                                        <img
                                            src={candidate.url}
                                            alt={candidate.name}
                                            className="w-16 h-16 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => onPreviewImage(candidate.url)}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-muted rounded mx-auto flex items-center justify-center text-xs text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
