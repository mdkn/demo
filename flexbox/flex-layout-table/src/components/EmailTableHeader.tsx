// T034-T038: Sticky table header component
export default function EmailTableHeader() {
  return (
    // T035: thead element with sticky positioning
    // T037: Sticky positioning with z-index
    // T038: Background and border
    <thead className="sticky top-0 z-10 border-b-2 border-gray-300 bg-white">
      <tr>
        {/* T036: Column headers */}
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
          Sender
        </th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
          Subject
        </th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
          Date
        </th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
          Status
        </th>
      </tr>
    </thead>
  )
}
