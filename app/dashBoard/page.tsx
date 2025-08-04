import 'server-only'; // <-- ensure this file cannot be imported from the client
import { caller } from '../../utils/trpc';


export default async function DashBoard() {
  const data = await caller.hello();
  return (
    <div>
      <h1>DashBoard</h1>
      <p>{data.message}</p>
    </div>
  )
}