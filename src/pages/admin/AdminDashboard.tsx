import { useContext, useState, useEffect } from 'react';
import { Settings, Users, Calendar, Globe, Save, Database } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import RegistrarTable from '../../components/admin/RegistrarTable';
import EventManager from '../../components/admin/EventManager';
import SecretaryManager from '../../components/admin/SecretaryManager';
import UserManager from '../../components/admin/UserManager';
import { DataContext } from '../../context/DataContext';
import { migrateRegistrations } from '../../utils/migrateRegistrations';

export default function AdminDashboard() {
  const { content, updateContent, allUsers } = useContext(DataContext);
  const [faviconUrl, setFaviconUrl] = useState('');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
  const [migrationResult, setMigrationResult] = useState<{ success: number; failed: number; skipped: number } | null>(null);

  // Local state for site settings
  const [localContent, setLocalContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    history: '',
    mission: '',
    socialLinks: { whatsapp: '', instagram: '' },
    backgroundImage: ''
  });

  // Sync local state when content is loaded
  useEffect(() => {
    if (content) {
      setLocalContent(prev => ({
        ...prev,
        heroTitle: content.heroTitle || '',
        heroSubtitle: content.heroSubtitle || '',
        history: content.history || '',
        mission: content.mission || '',
        socialLinks: content.socialLinks || { whatsapp: '', instagram: '' },
        backgroundImage: content.backgroundImage || ''
      }));
      setFaviconUrl(content.favicon || '');
    }
  }, [content]);

  const handleSaveSettings = async () => {
    try {
      await updateContent({
        favicon: faviconUrl,
        heroTitle: localContent.heroTitle,
        heroSubtitle: localContent.heroSubtitle,
        history: localContent.history,
        mission: localContent.mission,
        socialLinks: localContent.socialLinks,
        backgroundImage: localContent.backgroundImage
      });
      alert('Site settings updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save settings.');
    }
  };

  const updateLocalContent = (field: string, value: string) => {
    setLocalContent(prev => ({ ...prev, [field]: value }));
  };

  const handleMigration = async () => {
    if (!confirm('This will update all existing registrations with missing mobile/batch data from user profiles. Continue?')) {
      return;
    }

    setMigrationStatus('running');
    setMigrationResult(null);

    try {
      const result = await migrateRegistrations();
      setMigrationResult(result);
      setMigrationStatus('complete');
      alert(`Migration complete!\n✅ Updated: ${result.success}\n⏭️ Skipped: ${result.skipped}\n❌ Failed: ${result.failed}`);
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      alert('Migration failed. Check console for details.');
    }
  };

  const [activeTab, setActiveTab] = useState<'registrar' | 'events' | 'secretaries' | 'settings' | 'users'>('registrar');

  const tabs = [
    { id: 'registrar', label: 'Registrations', icon: <Users className="w-4 h-4" /> },
    { id: 'users', label: 'Users & Stats', icon: <Users className="w-4 h-4" /> },
    { id: 'events', label: 'Events & Rules', icon: <Calendar className="w-4 h-4" /> },
    { id: 'secretaries', label: 'Team Members', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Site Settings', icon: <Settings className="w-4 h-4" /> }
  ] as const;

  return (
    <div className="pt-24 pb-12 min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 bg-black/60 backdrop-blur-md w-fit px-6 py-3 rounded-2xl shadow-lg border border-white/10">
          <Settings className="text-emerald-500" />
          Admin Control Center
        </h2>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-105'
                : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {activeTab === 'registrar' && <RegistrarTable />}

          {activeTab === 'users' && <UserManager />}

          {activeTab === 'events' && <EventManager />}

          {activeTab === 'secretaries' && <SecretaryManager />}

          {activeTab === 'settings' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-black/60 backdrop-blur-md rounded-[2rem] shadow-lg border border-white/10 p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" /> Site Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-dashed border-blue-500/30">
                      <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                        <img src="https://cloudinary.com/favicon.png" className="w-4 h-4 opacity-80" alt="Cloudinary" />
                        Cloudinary Storage Configuration
                      </h4>

                      {(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) ? (
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-300">
                          <div className="p-2 bg-blue-500/20 rounded-full">
                            <Save className="w-4 h-4" />
                          </div>
                          <div className="text-xs">
                            <p className="font-bold">Securely Configured</p>
                            <p className="opacity-70">Using credentials from environment settings.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">
                                Cloud Name
                              </label>
                              <input
                                placeholder="e.g. demo"
                                defaultValue={JSON.parse(localStorage.getItem('cloudinary_config') || '{}').cloudName || ''}
                                onChange={e => {
                                  const config = JSON.parse(localStorage.getItem('cloudinary_config') || '{}');
                                  config.cloudName = e.target.value;
                                  localStorage.setItem('cloudinary_config', JSON.stringify(config));
                                }}
                                className="w-full p-2 bg-black/60 rounded-lg border border-white/10 text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">
                                Upload Preset (Unsigned)
                              </label>
                              <input
                                placeholder="e.g. my_preset"
                                defaultValue={JSON.parse(localStorage.getItem('cloudinary_config') || '{}').uploadPreset || ''}
                                onChange={e => {
                                  const config = JSON.parse(localStorage.getItem('cloudinary_config') || '{}');
                                  config.uploadPreset = e.target.value;
                                  localStorage.setItem('cloudinary_config', JSON.stringify(config));
                                }}
                                className="w-full p-2 bg-black/60 rounded-lg border border-white/10 text-white text-xs"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2 italic">
                            * Requires an <strong>Unsigned Upload Preset</strong> from your Cloudinary Settings.
                          </p>
                        </>
                      )}
                    </div>

                    <div>
                      <ImageUploader
                        label="Favicon"
                        folder="site/favicons"
                        currentImage={faviconUrl}
                        onImageUploaded={setFaviconUrl}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        WhatsApp Group Link
                      </label>
                      <input
                        placeholder="https://chat.whatsapp.com/..."
                        value={localContent.socialLinks?.whatsapp || ''}
                        onChange={e => setLocalContent(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, whatsapp: e.target.value }
                        }))}
                        className="w-full p-3 bg-black/40 rounded-xl border border-white/10 focus:border-emerald-500 text-white outline-none text-sm placeholder-slate-500 transition-colors"
                      />
                    </div>

                    <div>
                      <ImageUploader
                        label="Site Background"
                        folder="site/backgrounds"
                        currentImage={localContent.backgroundImage}
                        onImageUploaded={(url) => updateLocalContent('backgroundImage', url)}
                      />
                      {localContent.backgroundImage && (
                        <button
                          onClick={() => updateLocalContent('backgroundImage', '')}
                          className="text-[10px] text-red-400 hover:text-red-300 mt-1 hover:underline"
                        >
                          Remove Background
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        Instagram Profile Link
                      </label>
                      <input
                        placeholder="https://instagram.com/..."
                        value={localContent.socialLinks?.instagram || ''}
                        onChange={e => setLocalContent(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                        }))}
                        className="w-full p-3 bg-black/40 rounded-xl border border-white/10 focus:border-emerald-500 text-white outline-none text-sm placeholder-slate-500 transition-colors"
                      />
                    </div>

                    <div className="h-[1px] bg-white/10 my-4" />

                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">Homepage Content</h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Hero Title</label>
                      <input
                        value={localContent.heroTitle}
                        onChange={e => updateLocalContent('heroTitle', e.target.value)}
                        className="w-full p-3 bg-black/40 rounded-xl border border-white/10 focus:border-emerald-500 text-white outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Hero Subtitle</label>
                      <textarea
                        value={localContent.heroSubtitle}
                        rows={2}
                        onChange={e => updateLocalContent('heroSubtitle', e.target.value)}
                        className="w-full p-3 bg-black/40 rounded-xl border border-white/10 focus:border-emerald-500 text-white outline-none text-sm"
                      />
                    </div>

                    <div className="h-[1px] bg-white/10 my-4" />

                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">Vision & Mission</h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Vision Text (History)</label>
                      <textarea
                        value={localContent.history}
                        rows={3}
                        onChange={e => updateLocalContent('history', e.target.value)}
                        className="w-full p-3 bg-black/40 rounded-xl border border-white/10 focus:border-emerald-500 text-white outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Mission Text</label>
                      <textarea
                        value={localContent.mission}
                        rows={3}
                        onChange={e => updateLocalContent('mission', e.target.value)}
                        className="w-full p-3 bg-black/40 rounded-xl border border-white/10 focus:border-emerald-500 text-white outline-none text-sm"
                      />
                    </div>

                    <div className="h-px bg-white/10 my-4" />

                    <button
                      onClick={handleSaveSettings}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 border border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-500/20"
                    >
                      <Save className="w-4 h-4" /> Update Settings
                    </button>

                    {/* Data Migration Section */}
                    <div className="h-px bg-white/10 my-6" />

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Tools</h4>
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <div className="flex items-start gap-3 mb-3">
                          <Database className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-sm font-bold text-white mb-1">Migrate Registration Data</h5>
                            <p className="text-xs text-slate-400">
                              Updates existing registrations with missing mobile and batch numbers from user profiles.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleMigration}
                          disabled={migrationStatus === 'running'}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${migrationStatus === 'running'
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-yellow-600 text-white hover:bg-yellow-500 shadow-lg hover:shadow-yellow-500/20'
                            }`}
                        >
                          <Database className="w-4 h-4" />
                          {migrationStatus === 'running' ? 'Migrating...' : 'Run Migration'}
                        </button>
                        {migrationResult && (
                          <div className="mt-3 text-xs space-y-1">
                            <p className="text-green-400">✅ Updated: {migrationResult.success}</p>
                            <p className="text-slate-400">⏭️ Skipped: {migrationResult.skipped}</p>
                            {migrationResult.failed > 0 && (
                              <p className="text-red-400">❌ Failed: {migrationResult.failed}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-8">
                {/* Stats Column */}
                <div className="bg-black/60 backdrop-blur-md rounded-[2rem] shadow-lg border border-white/10 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="w-32 h-32 text-emerald-500" />
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Users</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white">{content ? allUsers?.length || 0 : '-'}</span>
                      <span className="text-emerald-400 font-bold">registered</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                      Active members across all batches.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
