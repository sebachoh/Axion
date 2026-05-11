'use client';

import React, { useState } from 'react';
import { 
  addStageTask, toggleStageTaskStatus, deleteStageTask,
  addStageProject, updateStageProjectStatus, deleteStageProject,
  addStageCommand, deleteStageCommand 
} from '@/app/(dashboard)/workspace/stage/actions';
import { 
  Terminal, Plus, Trash2, Folder, CheckCircle, Play, Pause, 
  ExternalLink, Clipboard, Check, Briefcase, FileText, Bookmark, 
  Layers, CheckSquare, ListTodo, Code2
} from 'lucide-react';

export interface StageTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: Date;
}

export interface StageProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: Date;
}

export interface StageCommand {
  id: string;
  title: string;
  command: string;
  description: string | null;
  category: string;
  createdAt: Date;
}

interface Props {
  initialTasks: StageTask[];
  initialProjects: StageProject[];
  initialCommands: StageCommand[];
}

export default function StageDashboard({ initialTasks, initialProjects, initialCommands }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [activeSection, setActiveSection] = useState<'tasks' | 'projects' | 'commands'>('tasks');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter Tasks
  const filteredTasks = initialTasks.filter(task => {
    if (activeTab === 'pending') return task.status === 'Pendiente';
    if (activeTab === 'completed') return task.status === 'Completado';
    return true;
  });

  // Extract command categories
  const categories = ['Todos', ...Array.from(new Set(initialCommands.map(c => c.category)))];

  // Filter Commands
  const filteredCommands = activeCategory === 'Todos' 
    ? initialCommands 
    : initialCommands.filter(c => c.category === activeCategory);

  const getPriorityBadge = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'alta':
        return <span style={{ background: 'rgba(255, 107, 107, 0.15)', color: '#ff6b6b', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Alta</span>;
      case 'media':
        return <span style={{ background: 'rgba(249, 202, 36, 0.15)', color: '#f9ca24', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Media</span>;
      case 'baja':
        default:
        return <span style={{ background: 'rgba(84, 160, 255, 0.15)', color: '#54a0ff', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Baja</span>;
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'en progreso':
        return '#54a0ff'; // Blue
      case 'completado':
        return '#1dd1a1'; // Green
      case 'planificado':
        return '#c8d6e5'; // Gray
      case 'pausado':
        default:
        return '#ff9f43'; // Orange
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pendientes del Stage</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {initialTasks.filter(t => t.status === 'Pendiente').length}
            </h2>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', color: '#ff9f43' }}>
            <ListTodo size={24} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Proyectos Activos</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {initialProjects.filter(p => p.status === 'En progreso').length}
            </h2>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', color: '#54a0ff' }}>
            <Layers size={24} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Comandos Guardados</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {initialCommands.length}
            </h2>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', color: '#1dd1a1' }}>
            <Code2 size={24} />
          </div>
        </div>

      </div>

      {/* Section Selector Tab Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
        <div className="stage-section-selector">
          <button 
            type="button"
            onClick={() => setActiveSection('tasks')}
            style={{
              background: activeSection === 'tasks' ? 'var(--color-text)' : 'transparent',
              color: activeSection === 'tasks' ? 'var(--color-bg)' : 'var(--color-text)',
              border: 'none', padding: '10px 24px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <CheckSquare size={16} /> Pendientes
          </button>
          <button 
            type="button"
            onClick={() => setActiveSection('projects')}
            style={{
              background: activeSection === 'projects' ? 'var(--color-text)' : 'transparent',
              color: activeSection === 'projects' ? 'var(--color-bg)' : 'var(--color-text)',
              border: 'none', padding: '10px 24px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Folder size={16} /> Proyectos
          </button>
          <button 
            type="button"
            onClick={() => setActiveSection('commands')}
            style={{
              background: activeSection === 'commands' ? 'var(--color-text)' : 'transparent',
              color: activeSection === 'commands' ? 'var(--color-bg)' : 'var(--color-text)',
              border: 'none', padding: '10px 24px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Terminal size={16} /> Comandos / Refs
          </button>
        </div>
      </div>

      {/* Selected Section Panel Container */}
      <div style={{ width: '100%' }}>
        {activeSection === 'tasks' && (
          /* Section: Pendientes (Tasks) */
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckSquare size={20} style={{ color: 'var(--color-text)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Lista de Pendientes</h3>
              </div>
              
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                <button 
                  type="button"
                  onClick={() => setActiveTab('all')} 
                  style={{ background: activeTab === 'all' ? 'var(--color-text)' : 'transparent', color: activeTab === 'all' ? 'var(--color-bg)' : 'var(--color-text)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Todos
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('pending')} 
                  style={{ background: activeTab === 'pending' ? 'var(--color-text)' : 'transparent', color: activeTab === 'pending' ? 'var(--color-bg)' : 'var(--color-text)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Pendientes
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('completed')} 
                  style={{ background: activeTab === 'completed' ? 'var(--color-text)' : 'transparent', color: activeTab === 'completed' ? 'var(--color-bg)' : 'var(--color-text)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Hechos
                </button>
              </div>
            </div>

            {/* Quick Add Task Form */}
            <form action={addStageTask} style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                name="title" 
                required 
                placeholder="Escribe un nuevo pendiente..." 
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
              />
              <select 
                name="priority" 
                defaultValue="media" 
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'black', outline: 'none', fontSize: '0.9rem', width: '100px' }}
              >
                <option value="baja" style={{color:'black'}}>Baja</option>
                <option value="media" style={{color:'black'}}>Media</option>
                <option value="alta" style={{color:'black'}}>Alta</option>
              </select>
              <button type="submit" className="glass-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', background: 'var(--color-text)', color: 'var(--color-bg)' }}>
                <Plus size={18} />
              </button>
            </form>

            {/* Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  No hay pendientes para mostrar... ¡Buen trabajo!
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <button 
                        type="button"
                        onClick={() => toggleStageTaskStatus(task.id, task.status)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: task.status === 'Completado' ? '#1dd1a1' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                      >
                        {task.status === 'Completado' ? (
                          <CheckCircle size={20} fill="#1dd1a1" style={{ color: '#fff' }} />
                        ) : (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--color-text-muted)' }} />
                        )}
                      </button>
                      <span style={{ 
                        fontSize: '0.95rem', 
                        fontWeight: 500,
                        textDecoration: task.status === 'Completado' ? 'line-through' : 'none',
                        color: task.status === 'Completado' ? 'var(--color-text-muted)' : 'var(--color-text)',
                        wordBreak: 'break-word'
                      }}>
                        {task.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {getPriorityBadge(task.priority)}
                      <button 
                        type="button"
                        onClick={() => deleteStageTask(task.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === 'projects' && (
          /* Section: Proyectos (Projects) */
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <Folder size={20} style={{ color: 'var(--color-text)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Proyectos del Stage</h3>
            </div>

            {/* Quick Add Project Form */}
            <form action={addStageProject} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div className="stage-flex-row">
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="Título del proyecto..." 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
                />
                <select 
                  name="status" 
                  defaultValue="En progreso" 
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'black', outline: 'none', fontSize: '0.9rem', width: '130px' }}
                >
                  <option value="Planificado" style={{color:'black'}}>Planificado</option>
                  <option value="En progreso" style={{color:'black'}}>En progreso</option>
                  <option value="Completado" style={{color:'black'}}>Completado</option>
                  <option value="Pausado" style={{color:'black'}}>Pausado</option>
                </select>
              </div>
              <div className="stage-flex-row">
                <input 
                  type="text" 
                  name="description" 
                  placeholder="Breve descripción de los objetivos..." 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
                />
                <button type="submit" className="glass-button" style={{ padding: '10px 20px', background: 'var(--color-text)', color: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </form>

            {/* Projects list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {initialProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  No hay proyectos registrados para el Stage aún.
                </div>
              ) : (
                initialProjects.map(project => (
                  <div key={project.id} style={{ padding: '1rem 1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)' }}>{project.title}</h4>
                        {project.description && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{project.description}</p>
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => deleteStageProject(project.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Creado: {new Date(project.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getProjectStatusColor(project.status), boxShadow: `0 0 6px ${getProjectStatusColor(project.status)}` }}></div>
                        <select 
                          defaultValue={project.status} 
                          onChange={(e) => updateStageProjectStatus(project.id, e.target.value)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 500, outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="Planificado" style={{color:'black'}}>Planificado</option>
                          <option value="En progreso" style={{color:'black'}}>En progreso</option>
                          <option value="Completado" style={{color:'black'}}>Completado</option>
                          <option value="Pausado" style={{color:'black'}}>Pausado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === 'commands' && (
          /* Section: Comandos y Referencias */
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <Terminal size={20} style={{ color: 'var(--color-text)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Comandos y Referencias</h3>
            </div>

            {/* Quick Add Command */}
            <form action={addStageCommand} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div className="stage-flex-row">
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="Ej: Levantar Docker..." 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
                />
                <input 
                  type="text" 
                  name="category" 
                  placeholder="Categoría (Ej: Git, Docker)" 
                  style={{ width: '150px', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
                />
              </div>
              <input 
                type="text" 
                name="command" 
                required 
                placeholder="docker-compose up -d --build" 
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem', fontFamily: 'monospace' }} 
              />
              <div className="stage-flex-row">
                <input 
                  type="text" 
                  name="description" 
                  placeholder="Para qué sirve este comando (Opcional)" 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
                />
                <button type="submit" className="glass-button" style={{ padding: '10px 16px', background: 'var(--color-text)', color: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <Plus size={16} /> Guardar
                </button>
              </div>
            </form>

            {/* Categories Selector */}
            {categories.length > 1 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      background: activeCategory === cat ? 'var(--color-text)' : 'rgba(255,255,255,0.05)',
                      color: activeCategory === cat ? 'var(--color-bg)' : 'var(--color-text)',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Commands list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredCommands.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  No hay comandos agregados en esta categoría.
                </div>
              ) : (
                filteredCommands.map(cmd => (
                  <div key={cmd.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{cmd.title}</span>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', padding: '2px 6px', borderRadius: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
                          {cmd.category}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => deleteStageCommand(cmd.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#a1c4fd', overflowX: 'auto', whiteSpace: 'nowrap', flex: 1 }}>
                        {cmd.command}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(cmd.id, cmd.command)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === cmd.id ? '#1dd1a1' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}
                        title="Copiar comando"
                      >
                        {copiedId === cmd.id ? <Check size={14} /> : <Clipboard size={14} />}
                      </button>
                    </div>

                    {cmd.description && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {cmd.description}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
