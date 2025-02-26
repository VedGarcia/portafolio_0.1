import { useState, useEffect, useMemo, useRef } from "react";
import { useTransition, animated } from "@react-spring/web";

interface MasonryItem {
  id: number;
  name: string;
  html_url: string;
  image_url: string;
  height: number;
}

interface GridItem extends MasonryItem {
  x: number;
  y: number;
  width: number;
}

interface MasonryProps {
  data: MasonryItem[];
}

const Masonry: React.FC<MasonryProps> = ({ data }: MasonryProps) => {
  const [columns, setColumns] = useState<number>(2);

  useEffect(() => {
    const updateColumns = () => {
      if (window.matchMedia("(min-width: 1500px)").matches) {
        setColumns(5);
      } else if (window.matchMedia("(min-width: 1000px)").matches) {
        setColumns(4);
      } else if (window.matchMedia("(min-width: 600px)").matches) {
        setColumns(3);
      } else {
        setColumns(1); // Mobile devices
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [heights, gridItems] = useMemo<[number[], GridItem[]]>(() => {
    const heights = new Array(columns).fill(0);
    const gridItems = data.map((child) => {
      const column = heights.indexOf(Math.min(...heights));
      const x = (width / columns) * column;
      const y = (heights[column] += child.height) - child.height; // Ajuste aquí
      return {
        ...child,
        x,
        y,
        width: width / columns,
      };
    });
    return [heights, gridItems];
  }, [columns, data, width]);

  const transitions = useTransition<
    GridItem,
    { x: number; y: number; width: number; height: number; opacity: number }
  >(gridItems, {
    keys: (item) => item.id,
    from: ({ x, y, width, height }) => ({ x, y, width, height, opacity: 0 }),
    enter: ({ x, y, width, height }) => ({ x, y, width, height, opacity: 1 }),
    update: ({ x, y, width, height }) => ({ x, y, width, height }),
    leave: { height: 0, opacity: 0 },
    config: { mass: 5, tension: 500, friction: 100 },
    trail: 25,
  });

  return (
    <div
      ref={ref}
      className="relative w-full h-full"
      style={{ height: Math.max(...heights) }}
    >
      {transitions((style, item) => (
        <a target="_blank" rel="noopener noreferrer" href={item.html_url}>
          <animated.div
            key={item.id}
            style={{ ...style, height: item.height }}
            className="absolute p-[15px] [will-change:transform,width,height,opacity]"
          >
            <div
              className="relative w-full h-full overflow-hidden uppercase text-[10px] leading-[10px] rounded-[4px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)] transition duration-300 ease hover:scale-110"
              style={{
                backgroundColor: "#ffffff",
                backgroundImage: `url(${item.image_url})`, //Ajuste aquí
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="w-full h-16 bg-linear-to-b from-amber-400/60">

              <h5 className="text-base p-2 leading-3 text-stone-800 font-medium font-[VictorMono-Bold]">{item.name}</h5>
              </div>
            </div>
          </animated.div>
        </a>
      ))}
    </div>
  );
};

export default Masonry;