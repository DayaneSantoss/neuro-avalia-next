
import { FilePlus } from "lucide-react"

export default async function ViewHipoteses({ hipoteses }) {

  const cores = [
    "bg-indigo-100 text-indigo-900",
    "bg-green-100 text-green-900",
    "bg-yellow-100 text-yellow-900",
    "bg-pink-100 text-pink-900",
    "bg-blue-100 text-blue-900",
    "bg-purple-100 text-purple-900"
  ]

  return (
        // <div className="px-6 py-5">
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
            <h2 className="text-xl font-semibold text-indigo-600 mb-4 flex items-center gap-2">
            <FilePlus size={20} /> Hipóteses
            </h2>

            {hipoteses && hipoteses.length > 0 ? (
            <div className="flex flex-wrap gap-4">
                {hipoteses
                    .sort((a, b) => (a.hipotese?.length || 0) - (b.hipotese?.length || 0))
                    .map((h, idx) => (
                    <div
                        key={h.id}
                        className={`rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition w-fit ${cores[idx % cores.length]}`}
                    >
                        <h2 className="text-md font-semibold">{h.hipotese}</h2>
                    </div>
                    ))}
                </div>
            ) : (
            <p className="text-gray-500">Nenhuma hipótese registrada até o momento.</p>
            )}
        </div>
        // </div>
)
}
