#! /usr/bin/env python3

from pyvirtualbench import PyVirtualBench, PyVirtualBenchException, FGenWaveformMode
from waveform import GaussianPulse
from matplotlib import pyplot as plt
from numpy import array, savetxt

def createPulseGaussian(amplitude, frecuency, NSamples, fs, HalfGuassianWidth):

    pulse = GaussianPulse(amplitude, frecuency, NSamples, fs, HalfGuassianWidth)
    pulse.getFFT() 

    frecFunction = pulse.y
    pulseArray = array(pulse.y)
    # w = pulse.w
    savetxt('test.txt', pulseArray)
    # plt.plot(w, frecFunction, color="red")
    # plt.show()

    fgen = virtualbench.acquire_function_generator()
    
    fgen.configure_arbitrary_waveform(pulseArray.tolist(), 0.00001)#Sample rate 100S/s=>0.01 100000=>0.00001
    fgen.run()
    fgen.release()
    

try:
    global virtualbench
    virtualbench = PyVirtualBench('VB8012-31C033D')
    amplitude = 1      #[V]
    frecuency = 10        #[Hz]
    NSamples = 1000 
    fs = 2               #[S/s]
    HalfGuassianWidth = 3 
    createPulseGaussian(amplitude, frecuency, NSamples, fs, HalfGuassianWidth)
except PyVirtualBenchException as e:
    print("Error/Warning %d occurred\n%s" % (e.status, e))
finally:
    virtualbench.release()
