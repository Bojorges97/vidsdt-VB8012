#! /usr/bin/env python3

import asyncio
from pyvirtualbench import PyVirtualBench, PyVirtualBenchException, FGenWaveformMode
from waveform import GaussianPulse
from websockets.server import serve
from numpy import array, savetxt, arange
import json
from matplotlib import pyplot as plt # Debug

def triggerWaveform(inputs):
    pulse = GaussianPulse(inputs['amplitude'], inputs['frecuency'], inputs['nSamples'], inputs['fs'], inputs['hgw'])
    pulse.getFFT() 

    pulseArray = array(pulse.y)
    sample_rate = 1/float(inputs['sampleRate']  )
    # w = pulse.w  # Debug
    # savetxt('test.txt', pulseArray) # Debug
    # plt.plot(w, frecFunction, color="red") # Debug
    # plt.show() # Debug
    fgen.stop()
    fgen.configure_arbitrary_waveform(pulseArray.tolist(), sample_rate)#Sample rate 100S/s=>0.01 100000=>0.00001
    fgen.run()
    
    # fgen.release()

def msoData():
    mso = virtualbench.acquire_mixed_signal_oscilloscope()

    mso.auto_setup()

    # sample_rate, acquisition_time, pretrigger_time, sampling_mode = mso.query_timing()
    # channels = mso.query_enabled_analog_channels()
    # channels_enabled, number_of_channels = virtualbench.collapse_channel_string(channels)

    mso.run()

    # Read the data by first querying how big the data needs to be, allocating the memory, and finally performing the read.
    analog_data = mso.read_analog_digital_u64()[0]
    # testArray = array(analog_data)# Debug
    # w = arange(0, testArray.size, 1, dtype=float)# Debug
    # # # print(testArray)# Debug
    # # # savetxt('test.txt', testArray) # Debug
    # plt.plot(w, testArray, color="red") # Debug
    # plt.show() # Debug
    return analog_data
async def echo(websocket):
    async for message in websocket:
        msg = json.loads(message)
        print(msg)
        try:
           triggerWaveform(msg)
           await websocket.send(json.dumps({'data' : msoData()}))
        except PyVirtualBenchException as e:
            print("Error/Warning %d occurred\n%s" % (e.status, e))
        finally:
            virtualbench.release()
    

if __name__ == '__main__':
    global virtualbench, fgen
    virtualbench = PyVirtualBench('VB8012-31C033D')
    # msoData() # debug
    fgen = virtualbench.acquire_function_generator()
    async def main():
        print("Service Up....")
        async with serve(echo, "0.0.0.0", 1025):
            await asyncio.Future()  # run forever

    asyncio.run(main())

