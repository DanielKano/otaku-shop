import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadStarsPreset } from 'tsparticles-preset-stars';

/**
 * ParticlesBackground - Fondo animado con efecto de partículas
 * 
 * @param {Object} props
 * @param {'stars'|'snow'|'bubbles'|'minimal'} props.preset - Preset de partículas
 * @param {boolean} props.dark - Usar colores para tema oscuro
 * @param {number} props.density - Densidad de partículas (1-100)
 * 
 * @example
 * <ParticlesBackground preset="stars" dark={isDark} />
 * <ParticlesBackground preset="minimal" density={30} />
 */
export default function ParticlesBackground({ 
  preset = 'minimal', 
  dark = false,
  density = 50 
}) {
  const particlesInit = useCallback(async engine => {
    await loadStarsPreset(engine);
  }, []);

  const getParticlesOptions = () => {
    const baseOptions = {
      background: {
        opacity: 0
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: 'push'
          },
          onHover: {
            enable: true,
            mode: 'repulse'
          },
          resize: true
        },
        modes: {
          push: {
            quantity: 4
          },
          repulse: {
            distance: 100,
            duration: 0.4
          }
        }
      },
      particles: {
        number: {
          value: density,
          density: {
            enable: true,
            area: 800
          }
        },
        opacity: {
          value: 0.5
        },
        size: {
          value: { min: 1, max: 3 }
        }
      },
      detectRetina: true
    };

    if (preset === 'stars') {
      return {
        preset: 'stars',
        background: {
          opacity: 0
        },
        particles: {
          number: {
            value: density
          },
          color: {
            value: dark ? '#b55cff' : '#6366f1'
          },
          opacity: {
            value: { min: 0.1, max: 0.5 }
          },
          size: {
            value: { min: 1, max: 3 }
          }
        }
      };
    }

    if (preset === 'snow') {
      return {
        ...baseOptions,
        particles: {
          ...baseOptions.particles,
          color: {
            value: dark ? '#42e2f4' : '#60a5fa'
          },
          shape: {
            type: 'circle'
          },
          move: {
            direction: 'bottom',
            enable: true,
            outModes: {
              default: 'out'
            },
            random: false,
            speed: 2,
            straight: false
          }
        }
      };
    }

    if (preset === 'bubbles') {
      return {
        ...baseOptions,
        particles: {
          ...baseOptions.particles,
          color: {
            value: ['#b55cff', '#ff3ea5', '#42e2f4']
          },
          shape: {
            type: 'circle'
          },
          move: {
            direction: 'top',
            enable: true,
            outModes: {
              default: 'out'
            },
            random: true,
            speed: 1,
            straight: false
          },
          size: {
            value: { min: 5, max: 15 }
          }
        }
      };
    }

    // Minimal preset
    return {
      ...baseOptions,
      particles: {
        ...baseOptions.particles,
        color: {
          value: dark ? '#b55cff' : '#8b5cf6'
        },
        links: {
          color: dark ? '#b55cff' : '#8b5cf6',
          distance: 150,
          enable: true,
          opacity: 0.2,
          width: 1
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce'
          },
          random: false,
          speed: 1,
          straight: false
        }
      }
    };
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={getParticlesOptions()}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
