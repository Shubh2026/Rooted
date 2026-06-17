'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRootedStore } from '../../store/useRootedStore';

interface TreeCanvasProps {
  interactive?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
}

interface FallingLeaf {
  x: number;
  y: number;
  size: number;
  angle: number;
  spin: number;
  speedY: number;
  speedX: number;
  color: string;
}

export default function TreeCanvas({ interactive = true }: TreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { growthPoints, treeHealth, hasNewBlossom, clearBlossomAlert } = useRootedStore();
  const [swayFactor, setSwayFactor] = useState(0.04); // Base wind sway
  const [particleArray, setParticleArray] = useState<Particle[]>([]);
  const [fallingLeaves, setFallingLeaves] = useState<FallingLeaf[]>([]);
  
  // Local state to track click bursts (blossom particles)
  const [burstParticles, setBurstParticles] = useState<Particle[]>([]);

  // Adjust wind sway based on tree health/footprint
  useEffect(() => {
    // Healthier trees are sturdier, less sway, while high emissions/weak trees sway violently or look frail
    if (treeHealth > 80) {
      setSwayFactor(0.02); // gentle breeze
    } else if (treeHealth < 40) {
      setSwayFactor(0.06); // struggling in rough winds
    } else {
      setSwayFactor(0.04); // moderate
    }
  }, [treeHealth]);

  // Handle blossom trigger (burst effect)
  useEffect(() => {
    if (hasNewBlossom && canvasRef.current) {
      const canvas = canvasRef.current;
      const burst: Particle[] = [];
      const colors = ['#ff8b94', '#ffaaa6', '#ffd3b6', '#a8e6cf', '#dcedc1'];
      
      // Spawn burst from center of canvas
      for (let i = 0; i < 40; i++) {
        burst.push({
          x: canvas.width / 2,
          y: canvas.height / 2 - 100,
          size: Math.random() * 6 + 3,
          speedX: (Math.random() - 0.5) * 6,
          speedY: (Math.random() - 0.5) * 6 - 2,
          opacity: 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      setBurstParticles(prev => [...prev, ...burst]);
      
      // Reset trigger in store
      const timer = setTimeout(() => {
        clearBlossomAlert();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasNewBlossom, clearBlossomAlert]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Initialize floating pollen/fireflies
    const particles: Particle[] = [];
    const particleColors = ['#a8e6cf', '#ffd3b6', '#dcedc1', '#a8ffd3'];
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedY: -(Math.random() * 0.5 + 0.2),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.3,
        color: particleColors[Math.floor(Math.random() * particleColors.length)]
      });
    }

    const leaves: FallingLeaf[] = [];

    const draw = () => {
      // 1. Clear Canvas with transparent backdrop
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      // 2. Determine Tree Size parameters based on growthPoints (XP)
      // xp of 100 = small sapling, xp of 1000 = grand ancient tree
      const maxXP = 1000;
      const progress = Math.min(1, Math.max(0.1, growthPoints / maxXP));
      
      // Calculate length of initial trunk
      const startLength = 70 + progress * 50; // 70px to 120px
      // Branching depth: 5 for sapling, 8 for mature tree
      const maxDepth = Math.min(8, Math.max(5, Math.floor(5 + progress * 3.5)));
      // Trunk thickness
      const trunkWidth = 10 + progress * 8; // 10px to 18px

      // 3. Draw Procedural Tree
      // Start from bottom center
      const startX = canvas.width / 2;
      const startY = canvas.height - 20;

      // Recursive Branching function
      const drawBranch = (
        bx: number,
        by: number,
        len: number,
        angle: number,
        width: number,
        depth: number
      ) => {
        const endX = bx + Math.sin(angle) * len;
        const endY = by - Math.cos(angle) * len;

        // Draw branch line
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(endX, endY);
        
        // Color transition: trunk is thick wood brown, branches get lighter/greener
        if (depth > 3) {
          ctx.strokeStyle = 'rgba(78, 52, 46, 0.95)'; // dark wood brown
        } else {
          // transition to lighter wood or mossy brown
          ctx.strokeStyle = `rgba(${78 + (3 - depth) * 15}, ${52 + (3 - depth) * 20}, ${46 + (3 - depth) * 5}, 0.95)`;
        }
        
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Base case: Leaf drawing at terminal branches
        if (depth === 0) {
          drawLeaves(endX, endY);
          return;
        }

        // Apply dynamic wind sway using sine wave
        // Branches sway more at the tips (lower depth)
        const windSway = Math.sin(time * 0.02 + depth * 0.8) * swayFactor * (4 / (depth + 1));
        
        // Split branches (2-way split)
        const branchRatio = 0.72 + (treeHealth / 100) * 0.06; // Healthier tree has longer sub-branches
        const nextLen = len * branchRatio;
        const angleDiff = 0.35 + (0.1 * Math.sin(time * 0.005)); // Slight breath breathing angle

        drawBranch(endX, endY, nextLen, angle - angleDiff + windSway, width * 0.68, depth - 1);
        drawBranch(endX, endY, nextLen, angle + angleDiff + windSway, width * 0.68, depth - 1);

        // Random chance to draw blossoms on intermediate healthy branches
        if (depth <= 3 && treeHealth > 50 && (growthPoints % 40 > 20)) {
          // Draw small blossom
          ctx.beginPath();
          ctx.arc(endX, endY, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(231, 111, 81, 0.75)'; // Coral pink blossom
          ctx.fill();
        }
      };

      // Helper to draw leaves clusters
      const drawLeaves = (lx: number, ly: number) => {
        // Leaves color and size based on health
        let leafColor = 'rgba(45, 106, 79, 0.75)'; // Healthy Forest Green
        let leafCount = 5;
        let leafSize = 6;

        if (treeHealth >= 85) {
          // Emerald Super Healthy
          leafColor = 'rgba(64, 145, 108, 0.85)';
          leafSize = 7;
          leafCount = 7;
        } else if (treeHealth >= 65) {
          // Healthy Green
          leafColor = 'rgba(45, 106, 79, 0.8)';
          leafSize = 6;
          leafCount = 6;
        } else if (treeHealth >= 45) {
          // Slightly Yellowing/Lighter Green
          leafColor = 'rgba(116, 198, 157, 0.75)';
          leafSize = 5;
          leafCount = 4;
        } else if (treeHealth >= 25) {
          // Withered orange-yellow, sparse
          leafColor = 'rgba(224, 169, 109, 0.7)';
          leafSize = 4;
          leafCount = 2;
          
          // Small random chance to trigger falling leaf
          if (Math.random() < 0.005 && leaves.length < 15) {
            leaves.push({
              x: lx,
              y: ly,
              size: Math.random() * 3 + 2,
              angle: Math.random() * Math.PI * 2,
              spin: (Math.random() - 0.5) * 0.05,
              speedY: Math.random() * 0.8 + 0.5,
              speedX: (Math.random() - 0.5) * 0.5,
              color: 'rgba(224, 169, 109, 0.8)'
            });
          }
        } else {
          // Critical/Dry brown, very sparse
          leafColor = 'rgba(141, 110, 99, 0.65)';
          leafSize = 3;
          leafCount = 1;

          if (Math.random() < 0.015 && leaves.length < 20) {
            leaves.push({
              x: lx,
              y: ly,
              size: Math.random() * 3 + 2,
              angle: Math.random() * Math.PI * 2,
              spin: (Math.random() - 0.5) * 0.1,
              speedY: Math.random() * 1.2 + 0.6,
              speedX: (Math.random() - 0.5) * 0.8,
              color: 'rgba(141, 110, 99, 0.75)'
            });
          }
        }

        // Draw cluster
        for (let i = 0; i < leafCount; i++) {
          const offsetX = Math.sin(i * 1.5) * (leafSize * 1.3);
          const offsetY = Math.cos(i * 1.5) * (leafSize * 1.3);
          
          ctx.beginPath();
          // Draw leaf as a smooth ellipse-like arc
          ctx.ellipse(
            lx + offsetX,
            ly + offsetY,
            leafSize,
            leafSize * 0.5,
            Math.PI / 4 + i,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = leafColor;
          ctx.fill();

          // Draw a blossom/flower if tree is super healthy and XP is high
          if (treeHealth >= 75 && i === 0 && growthPoints > 200) {
            ctx.beginPath();
            ctx.arc(lx, ly, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ff8b94'; // Accent blossom
            ctx.fill();
          }
        }
      };

      // Draw the tree!
      // Base root offset to center trunk
      drawBranch(startX, startY, startLength, 0, trunkWidth, maxDepth);

      // 4. Draw & Update Floating Particles (Pollen/Fireflies)
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(time * 0.01 + p.y) * 0.1; // drift sway
        
        // Reset particle if it drifts off top or sides
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 5. Draw & Update Falling Leaves
      for (let i = leaves.length - 1; i >= 0; i--) {
        const leaf = leaves[i];
        leaf.y += leaf.speedY;
        leaf.x += leaf.speedX + Math.sin(time * 0.05 + leaf.y) * 0.5;
        leaf.angle += leaf.spin;

        // Draw spinning leaf
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size * 1.5, leaf.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = leaf.color;
        ctx.fill();
        ctx.restore();

        // Remove leaf if off canvas bottom
        if (leaf.y > canvas.height) {
          leaves.splice(i, 1);
        }
      }

      // 6. Draw & Update Active Action Burst Particles
      setBurstParticles(prev => {
        const remaining: Particle[] = [];
        prev.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.speedY += 0.08; // gravity
          p.opacity -= 0.02;

          if (p.opacity > 0) {
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.restore();
            remaining.push(p);
          }
        });
        return remaining;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [growthPoints, treeHealth, swayFactor, burstParticles]);

  // Handle click to trigger manual micro-burst of pollen (delight factor)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const burst: Particle[] = [];
    const colors = ['#81b29a', '#f4f1de', '#e07a5f', '#3d405b', '#f2cc8f'];

    for (let i = 0; i < 12; i++) {
      burst.push({
        x: clickX,
        y: clickY,
        size: Math.random() * 4 + 1.5,
        speedX: (Math.random() - 0.5) * 3,
        speedY: (Math.random() - 0.5) * 3 - 1,
        opacity: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    setBurstParticles(prev => [...prev, ...burst]);
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[300px] md:min-h-[400px]">
      <canvas
        ref={canvasRef}
        width={450}
        height={450}
        onClick={handleCanvasClick}
        className="w-full max-w-[450px] aspect-square drop-shadow-[0_10px_20px_rgba(15,58,31,0.15)] dark:drop-shadow-[0_10px_30px_rgba(82,183,136,0.1)] cursor-pointer select-none"
      />
      {interactive && (
        <div className="absolute bottom-2 text-center text-xs text-muted-text opacity-50 select-none pointer-events-none">
          Click your garden to scatter pollen
        </div>
      )}
    </div>
  );
}
