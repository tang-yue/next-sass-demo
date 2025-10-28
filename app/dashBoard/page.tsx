import 'server-only'; // <-- ensure this file cannot be imported from the client
import { caller } from '../../utils/trpc';


export default async function DashBoard() {
  const data = await caller.app.getAll();
  return (
    <div>
      <h1>DashBoard</h1>
      <p>Total apps: {data.apps?.length || 0}</p>
    </div>
  )
}