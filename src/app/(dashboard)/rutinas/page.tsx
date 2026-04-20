import RoutineList from '@/components/RoutineList';
import HabitsAnalytics from '@/components/HabitsAnalytics';
import { getRoutineTasks, getHabitsAnalytics } from '@/core/usecases/routineUsecases';

export default async function RutinasPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const morningTasks = await getRoutineTasks('morning', todayStr);
  const nightTasks = await getRoutineTasks('night', todayStr);
  
  // Predictably fetch 28 days of history. The client can slice it to 7 if requested.
  const analyticsData = await getHabitsAnalytics(28);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Rutinas</h1>
        <p className="page-subtitle">Dashboard / Tracking Diario</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* Columna Izquierda: Mañana */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, paddingLeft: '0.5rem', borderLeft: '3px solid var(--color-text)' }}>Mañana</h2>
          <RoutineList initialTasks={morningTasks} type="morning" dateStr={todayStr} />
        </div>

        {/* Columna Derecha: Tarde/Noche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, paddingLeft: '0.5rem', borderLeft: '3px solid var(--color-text)' }}>Noche</h2>
          <RoutineList initialTasks={nightTasks} type="night" dateStr={todayStr} />
        </div>

      </div>

      <HabitsAnalytics data={analyticsData} />
    </div>
  );
}
