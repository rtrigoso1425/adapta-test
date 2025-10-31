import * as React from "react"

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export function TagsSelector({
  tags,
  value = [],
  onChange,
  placeholder = "Selecciona opciones",
  className = ""
}) {
  const [selectedTags, setSelectedTags] = useState([]);
  const selectedsContainerRef = useRef(null);

  // Sincronizar con el prop value
  useEffect(() => {
    if (value && value.length > 0) {
      const selected = tags.filter(tag => value.includes(tag.id));
      setSelectedTags(selected);
    } else {
      setSelectedTags([]);
    }
  }, [value, tags]);

  const removeSelectedTag = (id) => {
    const newSelected = selectedTags.filter((tag) => tag.id !== id);
    setSelectedTags(newSelected);
    if (onChange) {
      onChange(newSelected.map(tag => tag.id));
    }
  };

  const addSelectedTag = (tag) => {
    const newSelected = [...selectedTags, tag];
    setSelectedTags(newSelected);
    if (onChange) {
      onChange(newSelected.map(tag => tag.id));
    }
  };

  useEffect(() => {
    if (selectedsContainerRef.current) {
      selectedsContainerRef.current.scrollTo({
        left: selectedsContainerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [selectedTags]);

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {/* Contenedor de tags seleccionados */}
      <div
        className="w-full flex items-center justify-start gap-1.5 bg-white border min-h-[44px] overflow-x-auto p-1.5 no-scrollbar"
        style={{
          borderRadius: 12,
        }}
        ref={selectedsContainerRef}>
        {selectedTags.length === 0 ? (
          <span className="text-gray-400 text-sm px-2">{placeholder}</span>
        ) : (
          selectedTags.map((tag) => (
            <motion.div
              key={tag.id}
              className="flex items-center gap-1 pl-2.5 pr-1 py-1 bg-white shadow-sm border shrink-0"
              style={{
                borderRadius: 10,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              layoutId={`tag-${tag.id}`}>
              <span className="text-gray-700 text-sm font-medium">
                {tag.label}
              </span>
              <button 
                type="button"
                onClick={() => removeSelectedTag(tag.id)} 
                className="p-0.5 rounded-full hover:bg-gray-100">
                <X className="size-4 text-gray-500" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Contenedor de tags disponibles */}
      {tags.length > selectedTags.length && (
        <div
          className="bg-white shadow-sm p-2 border w-full max-h-[140px] overflow-y-auto"
          style={{
            borderRadius: 12,
          }}>
          <div className="flex flex-wrap gap-1.5">
            {tags
              .filter((tag) =>
                !selectedTags.some((selected) => selected.id === tag.id))
              .map((tag) => (
                <motion.button
                  key={tag.id}
                  type="button"
                  layoutId={`tag-${tag.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100/60 hover:bg-gray-200/80 transition-colors shrink-0"
                  onClick={() => addSelectedTag(tag)}
                  style={{
                    borderRadius: 10,
                  }}>
                  <span className="text-gray-700 text-sm font-medium">
                    {tag.label}
                  </span>
                </motion.button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}