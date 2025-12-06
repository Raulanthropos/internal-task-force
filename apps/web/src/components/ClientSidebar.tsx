import { useQuery, gql } from 'urql';

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      name
      logoUrl
      projects {
        id
        codeName
        clientContactPerson
        status
      }
    }
  }
`;

export function ClientSidebar() {
    const [{ data, fetching, error }] = useQuery({ query: GET_CLIENTS });

    if (fetching) return <div className="w-16 h-full bg-slate-900 border-r border-slate-800 animate-pulse"></div>;
    if (error) return <div className="hidden"></div>;

    return (
        <aside className="w-16 h-full bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 space-y-4 fixed left-0 top-0 bottom-0 z-50">
            {data?.clients.map((client: any) => (
                <div key={client.id} className="group relative">
                    {/* Client Logo / Initials */}
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 hover:border-blue-500 overflow-hidden cursor-pointer flex items-center justify-center transition-all">
                        {client.logoUrl && (client.logoUrl.startsWith('http') || client.logoUrl.startsWith('/')) ? (
                            <img src={client.logoUrl} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold text-white">{client.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>

                    {/* Hover Popover */}
                    <div className="absolute left-14 top-0 w-64 p-4 bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <h3 className="text-lg font-bold text-white mb-2">{client.name}</h3>
                        <div className="space-y-2">
                            {client.projects.length === 0 ? (
                                <p className="text-xs text-slate-400">No active projects</p>
                            ) : (
                                client.projects.map((project: any) => (
                                    <div key={project.id} className="bg-slate-800 p-2 rounded text-sm border border-slate-700">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-blue-400">{project.codeName}</span>
                                            <span className={`text-[10px] px-1 rounded ${project.status === 'PLANNING' ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        {project.clientContactPerson && (
                                            <p className="text-xs text-slate-400">POC: <span className="text-slate-300">{project.clientContactPerson}</span></p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </aside>
    );
}
