'use client';
import React, { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { Pin, PinOff, GripVertical, Trash2, ExternalLink, Building2, Link as LinkIcon, User } from 'lucide-react';

interface BankItem {
  id: string;
  category: string;
  title: string;
  meta: string;
  createdAt: Date;
}
